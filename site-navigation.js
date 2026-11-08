const siteNav = document.querySelector('.raven-site-nav');
const pageLink = siteNav.querySelector('[aria-current]');
const pageCurrent = pageLink.getAttribute('aria-current');

function updateCurrentSection() {
  const sectionId = location.hash.slice(1);
  let current = pageLink;
  if (pageLink.dataset.nav === 'home' && document.getElementById(sectionId)?.closest('#guides')) {
    current = siteNav.querySelector('[data-nav="guides"]');
  } else if (pageLink.dataset.nav === 'map' && sectionId === 'community') {
    current = siteNav.querySelector('[data-nav="community"]');
  }
  siteNav.querySelector('[aria-current]')?.removeAttribute('aria-current');
  current.setAttribute('aria-current', current === pageLink ? pageCurrent : 'location');
}

window.addEventListener('hashchange', updateCurrentSection);
updateCurrentSection();
