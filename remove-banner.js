(() => {
'use strict';
StuHack.register(() => {
// Positional deletion can destroy document pages.
document.querySelectorAll('#document-wrapper .banner-wrapper').forEach(banner => banner.remove());
});
})();