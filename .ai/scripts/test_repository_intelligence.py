#!/usr/bin/env python3
"""Regression tests for repository intelligence path handling."""

from __future__ import annotations

import unittest

from repository_intelligence_lib import is_excluded


class IsExcludedTests(unittest.TestCase):
    def test_excludes_repository_intelligence_metadata(self) -> None:
        paths = [
            ".ai/local/repository-intelligence-state.json",
            ".codegraph/codegraph.db",
            ".cocoindex_code/settings.yml",
        ]

        for path in paths:
            with self.subTest(path=path):
                self.assertTrue(is_excluded(path))

    def test_excludes_metadata_with_explicit_relative_prefix(self) -> None:
        self.assertTrue(is_excluded("./.ai/local/repository-intelligence-state.json"))

    def test_does_not_strip_meaningful_leading_dot(self) -> None:
        self.assertFalse(is_excluded(".github/workflows/ci.yml"))


if __name__ == "__main__":
    unittest.main()
