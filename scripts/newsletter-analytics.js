/* Reuse the site's existing GA4 setup; PostHog captures the same link labels. */
(function () {
  'use strict';
  if (window.archigenNewsletterAnalytics) return;
  window.archigenNewsletterAnalytics = true;
  document.addEventListener('click', function (event) {
    var link = event.target instanceof Element && event.target.closest('a[data-ph-capture-attribute-cta]');
    if (!link) return;
    var cta = link.getAttribute('data-ph-capture-attribute-cta');
    if (['newsletter-anchor', 'newsletter-mailto', 'newsletter-web'].indexOf(cta) === -1) return;
    try {
      if (localStorage.getItem('plausible_ignore') === 'true' || typeof window.gtag !== 'function') return;
      var placement = link.getAttribute('data-ph-capture-attribute-placement');
      var ctaId = link.getAttribute('data-ph-capture-attribute-cta_id');
      if (!placement || !ctaId) return;
      window.gtag('event', 'newsletter_click', {cta: cta, placement: placement, cta_id: ctaId});
    } catch (_) {
      // Storage restrictions or analytics failures must not interrupt navigation.
    }
  });
}());
