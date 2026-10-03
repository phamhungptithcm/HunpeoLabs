import { expect, it } from 'vitest';
import { activeReadingSection, readingHeadings } from '@/lib/blog/reading-layout';
it('TOC identities match renderer paths, preserve nested levels and ignore empty headings', () => {
  expect(readingHeadings({ type:'doc', content:[
    { type:'heading', attrs:{ level:2 }, content:[{ type:'text',text:'Opening' }] },
    { type:'blockquote',content:[{ type:'heading',attrs:{level:3},content:[{type:'text',text:'Nested'}] }] },
    { type:'heading',attrs:{level:4},content:[] },
  ] })).toEqual([{ id:'section-0-0', text:'Opening', level:2 },{ id:'section-0-1-0',text:'Nested',level:3 }]);
});
it('does not activate first heading before it reaches the reading line and updates both ways', () => {
 expect(activeReadingSection([{id:'first',top:400}])).toBeNull();
 expect(activeReadingSection([{id:'first',top:-300},{id:'second',top:119},{id:'third',top:400}])).toBe('second');
 expect(activeReadingSection([{id:'first',top:100},{id:'second',top:500}])).toBe('first');
 expect(activeReadingSection([])).toBeNull();
});
