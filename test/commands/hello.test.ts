import {expect, test} from '@oclif/test'

describe('@apps', () => {
  test
  .stdout()
  .command(['@apps'])
  .it('runs @apps', ctx => {
    expect(ctx.stdout).to.exist
  })
})
