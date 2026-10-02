"""Regression checks for explicit adapter selection and required-file validation."""
import json
import tempfile
import unittest
from pathlib import Path

from sync_agent_assets import selected_adapters, generated_skill_roots, ADAPTER_FILES
from validate_agent_config import validate_native_adapters


class AdapterSelectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / ".ai/context").mkdir(parents=True)

    def selection(self, value):
        (self.root / ".ai/context/agent-adapters.json").write_text(json.dumps(value))

    def test_default_preserves_full_scaffold(self):
        self.assertEqual(selected_adapters(self.root), list(ADAPTER_FILES))

    def test_selected_roots_do_not_create_other_adapters(self):
        self.selection({"agents": ["codex", "claude"]})
        self.assertEqual(generated_skill_roots(self.root), [
            self.root / ".agents/skills", self.root / ".claude/skills"])
        errors = []
        validate_native_adapters(self.root, errors)
        self.assertEqual(errors, [])  # Codex/Claude checked by required files/hooks.

    def test_invalid_selection_fails_closed(self):
        for agents in [[], ["unknown"], ["codex", "codex"], [None], "codex"]:
            with self.subTest(agents=agents):
                self.selection({"agents": agents})
                with self.assertRaises(ValueError):
                    selected_adapters(self.root)

    def test_invalid_top_level_shape_fails_closed(self):
        for value in [[], "codex", None]:
            self.selection(value)
            with self.assertRaises(ValueError):
                selected_adapters(self.root)

    def test_selected_missing_native_adapter_is_an_error(self):
        self.selection({"agents": ["copilot"]})
        errors = []
        validate_native_adapters(self.root, errors)
        self.assertEqual(errors, ["selected adapter file missing: .github/copilot-instructions.md"])

    def test_selected_adapter_keeps_policy_validation(self):
        self.selection({"agents": ["copilot"]})
        (self.root / ".github").mkdir()
        (self.root / ".github/copilot-instructions.md").write_text("unrelated text")
        errors = []
        validate_native_adapters(self.root, errors)
        self.assertEqual(len(errors), 3)


if __name__ == "__main__":
    unittest.main()
