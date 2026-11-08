if (location.hash === '#community') {
  location.replace('property-map.html' + location.search + location.hash);
}

const searchForm = document.querySelector('.search');
const search = document.querySelector('#service-search');
const guides = document.querySelector('#guide-results');
const guideHeading = document.querySelector('#guide-title');
const count = document.querySelector('#result-count');
const clearFilter = document.querySelector('#clear-filter');
const noResults = document.querySelector('#no-results');
const categories = [...document.querySelectorAll('[data-category-link]')];
const groups = [...document.querySelectorAll('[data-guide-group]')];
const languageButtons = [...document.querySelectorAll('[data-language]')];
const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
const entries = [...guides.querySelectorAll('details')].map(guide => {
  const summary = [...guide.querySelectorAll('summary [lang]')].map(element => element.textContent);
  return {
    guide,
    terms: normalize([...summary, guide.dataset.search].join(' ')).split(' '),
  };
});
let activeCategory = '';

function updateResults() {
  const tokens = normalize(search.value).split(' ').filter(Boolean);
  let shown = 0;
  for (const { guide, terms } of entries) {
    const inCategory = !activeCategory || guide.closest('[data-guide-group]').id === activeCategory;
    guide.hidden = !inCategory || !tokens.every(token => terms.some(term => token.length < 3 ? term === token : term.startsWith(token)));
    if (!guide.hidden) shown++;
  }
  for (const group of groups) {
    group.hidden = !group.querySelector('details:not([hidden])');
  }
  for (const category of categories) {
    if (category.dataset.categoryLink === activeCategory) {
      category.setAttribute('aria-current', 'true');
    } else {
      category.removeAttribute('aria-current');
    }
  }
  const inTelugu = document.documentElement.lang === 'te';
  count.textContent = inTelugu ? shown + ' సేవలు' : shown + (shown === 1 ? ' guide' : ' guides');
  noResults.hidden = shown !== 0;
  clearFilter.hidden = !activeCategory && tokens.length === 0;
}

function setLanguage(language) {
  document.documentElement.lang = language;
  search.placeholder = language === 'te' ? 'ఉదా: ఆదాయ ధ్రువపత్రం, ఈసీ, లైసెన్స్' : 'Try income certificate, EC, or licence';
  for (const button of languageButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  }
  updateResults();
}

for (const button of languageButtons) {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
}
for (const category of categories) {
  category.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    search.value = '';
    activeCategory = category.dataset.categoryLink;
    updateResults();
    location.hash = 'guide-results';
    guides.scrollIntoView();
    guideHeading.focus({ preventScroll: true });
  });
}
search.addEventListener('input', () => {
  activeCategory = '';
  updateResults();
});
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  location.hash = 'guide-results';
  guides.scrollIntoView();
  guideHeading.focus({ preventScroll: true });
});
clearFilter.addEventListener('click', () => {
  search.value = '';
  activeCategory = '';
  updateResults();
  guideHeading.focus({ preventScroll: true });
});

guideHeading.tabIndex = -1;
for (const element of document.querySelectorAll('[data-enhancement]')) element.hidden = false;
setLanguage('en');
