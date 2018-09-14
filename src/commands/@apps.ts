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

    let columns = {
      id: {
        header: 'ID',
        extra: true,
      },
      name: {},
      owner: {
        get: (r: Heroku.App) => r.owner && r.owner.email,
      },
      region: {
        get: (r: Heroku.App) => r.region && r.region.name,
      },
      space: {
        get: (r: Heroku.App) => r.space && r.space.name,
        extra: true,
      },
      stack: {
        get: (r: Heroku.App) => r.stack && r.stack.name,
        extra: true,
      },
      team: {
        get: (r: Heroku.App) => r.team && r.team.name,
        extra: true,
      },
      updated_at: {
        extra: true,
      },
      web_url: {
        header: 'Url',
        extra: true,
      },
    }

    let path = '/users/~/apps'
    if (flags.team) {
      path = `/organizations/${flags.team}/apps`
      columns.team.extra = false
    }

    let {body: apps} = await this.heroku.get<Heroku.App[]>(path)

    if (flags.space) {
      apps = apps.filter(a => a.space && (a.space.name === flags.space || a.space.id === flags.space))
      columns.space.extra = false
    }

    function grabFlags() {
      let f: any = {}
      for (let key of Object.keys(ux.table.flags)) {
        let v: any = (flags as any)[key]
        f[key] = v
      }
      return f
    }

    ux.table(apps,
      columns,
      {
        printLine: this.log,
        ...grabFlags()
      }
    )
  }
}
