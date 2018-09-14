import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {ux} from 'cli-ux'

export default class Users extends Command {
  static flags = {
    team: flags.team(),
    space: flags.string({char: 's', description: 'space to view'}),
    ...ux.table.flags
  }

  async run() {
    const {flags} = this.parse(Users)

    let path = '/users/~/apps'
    if (flags.team) path = `/organizations/${flags.team}/apps`

    let {body: apps} = await this.heroku.get<Heroku.App[]>(path)

    if (flags.space) {
      apps = apps.filter(a => a.space && (a.space.name === flags.space || a.space.id === flags.space))
    }

    const columns = {
      name: {},
      owner: {
        get: (r: Heroku.App) => r.owner && r.owner.email,
      },
      region: {
        get: (r: Heroku.App) => r.region && r.region.name,
      },
      stack: {
        get: (r: Heroku.App) => r.stack && r.stack.name,
        extra: true,
      },
    }

    function grabFlags() {
      let f: any = {}
      for (let key of Object.keys(ux.table.flags)) {
        let v: any = (flags as any)[key]
        f[key] = v
      }
      return f
    }

    ux.table(apps, columns, {printLine: this.log, ...grabFlags()})
  }
}
