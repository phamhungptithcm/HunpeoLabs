import { PendingNavigation } from "./action-progress";
import styles from "./blog-loading.module.css";

function Lines() {
  return <div className={styles.lines} aria-hidden="true"><span /><span /><span /></div>;
}

export function BlogNoScriptReading() {
  // Streamed HTML is normally revealed by React's inline script. Without JS,
  // expose the semantic reading regions when they arrive, without framework IDs.
  return <noscript><style>{`
    body:has(> div[hidden] > main.container:not([data-blog-loading])),
    body:has(> div[hidden] > article.story) {
      display: flex; flex-direction: column;
    }
    body > div[hidden]:has(> main.container:not([data-blog-loading])) {
      display: block; order: 1;
    }
    body > div[hidden]:has(> section.related-stories) { display: block; order: 2; }
    body > div[hidden]:has(> article.story) { display: block; order: 2; }
    body:has(> div[hidden] > main.container:not([data-blog-loading])) > footer,
    body:has(> div[hidden] > article.story) > footer { order: 3; }
    body:has(main.container:not([data-blog-loading])) [data-blog-loading],
    [data-blog-related-loading] { display: none; }
  `}</style></noscript>;
}

export function RelatedPostsLoading() {
  return (
    <section className="container related-stories" aria-label="Related articles" aria-busy="true" data-blog-related-loading>
      <h2>Related posts</h2>
      <p className="sr-only" role="status">Loading related posts…</p>
      <div className="story-grid" aria-hidden="true">
        {[0, 1, 2].map((key) => <div className={styles.related} key={key}><Lines /></div>)}
      </div>
    </section>
  );
}

export function BlogLoading({ article = false }: { article?: boolean }) {
  return (
    <main className={`container ${styles.loading}`} aria-busy="true" data-blog-loading>
      <PendingNavigation />
      <p className="sr-only" role="status">{article ? "Loading article…" : "Loading posts…"}</p>
      {article ? (
        <>
          <header className={`article-heading ${styles.heading}`} aria-hidden="true">
            <div className={styles.eyebrow} /><div className={styles.title} /><Lines />
            <div className={styles.byline} />
          </header>
          <div className={styles.articleBody} aria-hidden="true"><Lines /><Lines /><Lines /></div>
        </>
      ) : (
        <>
          <section className="journal-intro">
            <div><div className="eyebrow tiny-rule">Notes from the people building products</div><h1>Ideas into <em>practice.</em></h1></div>
            <div><p>Stories about building products, engineering and what we learn along the way at Hunpeo Labs.</p></div>
          </section>
          <div className={`feature ${styles.feature}`} aria-hidden="true">
            <div className={styles.art} /><div className={styles.featureCopy}><div className={styles.title} /><Lines /><div className={styles.byline} /></div>
          </div>
          <div className={styles.toolbar} aria-hidden="true" />
          <div className="story-grid" aria-hidden="true">
            {[0, 1, 2].map((key) => <div key={key}><div className={styles.thumb} /><Lines /></div>)}
          </div>
        </>
      )}
    </main>
  );
}
