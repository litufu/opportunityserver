const {  spawnSync} = require('child_process');

const Query = {
  me: (parent, args, ctx) => {
    const userId = getUserId(ctx)
    return ctx.prisma.user({ id: userId })
  },
}

module.exports = {
  Query,
}