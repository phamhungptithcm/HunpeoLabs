module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start --hostname 127.0.0.1 --port 4173",
      startServerReadyPattern: "Ready",
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/services",
        "http://127.0.0.1:4173/contact",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
