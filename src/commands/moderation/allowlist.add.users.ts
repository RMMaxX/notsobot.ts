import { Command, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';

import { CommandTypes, EmbedColors, GuildAllowlistTypes } from '../../constants';
import { Parameters } from '../../utils';

import { BaseCommand } from '../basecommand';

import { createAllowlistEmbed } from './allowlist';
import { createAllowlist } from './allowlist.add';


export interface CommandArgsBefore {
  users: Array<Structures.Member | Structures.User> | null,
}

export interface CommandArgs {
  users: Array<Structures.Member | Structures.User>,
}


export default class AllowlistAddUsersCommand extends BaseCommand {
  aliases = ['allowlist add user'];
  name = 'allowlist add users';

  disableDm = true;
  label = 'users';
  metadata = {
    description: 'Add users to the allowlist.',
    examples: [
      'allowlist add user notsobot',
      'allowlist add users <@300505364032389122> <@61189081970774016>',
    ],
    type: CommandTypes.MODERATION,
    usage: 'allowlist add users ...<user mention|name>',
  };
  permissionsClient = [Permissions.EMBED_LINKS];
  permissions = [Permissions.ADMINISTRATOR];
  type = Parameters.membersOrUsers({allowBots: false});

  onBeforeRun(context: Command.Context, args: CommandArgsBefore) {
    const { users } = args;
    return !!users && !!users.length;
  }

  onCancelRun(context: Command.Context, args: CommandArgsBefore) {
    if (args.users) {
      return context.editOrReply('⚠ Unable to find any users.');
    }
    return context.editOrReply('⚠ Provide some kind of query.');
  }

  async run(context: Command.Context, args: CommandArgs) {
    const { users } = args;
    const payloads: Array<{
      item: Structures.User,
      type: GuildAllowlistTypes.USER,
    }> = users.map((user) => ({item: user, type: GuildAllowlistTypes.USER}));
    const { settings, title } = await createAllowlist(context, payloads);
    return createAllowlistEmbed(context, settings.allowlist, {title});
  }
}
