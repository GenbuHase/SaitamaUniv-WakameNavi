export default defineEventHandler(event => {
  const { req, res } = event.node;

  console.log(`${req.method}: ${req.url}`, event);
});
