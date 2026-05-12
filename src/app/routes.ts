import { type RouteConfigEntry, index, route } from '@react-router/dev/routes';

const routes: RouteConfigEntry[] = [
  index('./page.jsx'),
  route('about', './about/page.jsx'),
  route('account', './account/page.jsx'),
  route('account/signin', './account/signin/page.jsx'),
  route('admin', './admin/page.jsx'),
  route('events', './events/page.jsx'),
  route('events/:id', './events/[id]/page.jsx'),
  route('news', './news/page.jsx'),
  route('ticket-demo', './ticket-demo/page.jsx'),
  route('__create/social-dev-shim', './__create/social-dev-shim/page.jsx'),
  route('sso-callback', './account/sso-callback/page.jsx'),

  route('api/events', './api/events/route.js'),
  route('api/categories', './api/categories/route.js'),
  route('api/news', './api/news/route.js'),
  route('api/sponsors', './api/sponsors/route.js'),
  route('api/bookings', './api/bookings/route.js'),
  route('api/bookings/confirm', './api/bookings/confirm/route.js'),
  route('api/admin/stats', './api/admin/stats/route.js'),
  route('api/razorpay/create-order', './api/razorpay/create-order/route.js'),
  route('api/razorpay/verify-payment', './api/razorpay/verify-payment/route.js'),
  route('api/__create/check-social-secrets', './api/__create/check-social-secrets/route.js'),

  route('*', './__create/not-found.tsx'),
];

export default routes;
