import { Command } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { Embed, Markup } from 'detritus-client/lib/utils';

import { editGuildSettings } from '../../api';
import { CommandTypes, EmbedColors, GuildAllowlistTypes } from '../../constants';
import GuildSettingsStore from '../../stores/guildsettings';

import { BaseCommand } from '../basecommand';

import { guildAllowlistType } from './allowlist';


export interface CommandArgs {
  only?: GuildAllowlistTypes,
}

export default class AllowlistClearCommand extends BaseCommand {
  name = 'allowlist clear';

  disableDm = true;
  label = 'only';
  metadata = {
    description: 'Clear out Channels/Roles/Users/Server-Wide allowlist.',
    examples: [
      'allowlist clear',
      'allowlist clear channels',
    ],
    type: CommandTypes.MODERATION,
    usage: 'allowlist clear ?<GuildDisableCommandsType>',
  };
  permissionsClient = [Permissions.EMBED_LINKS];
  permissions = [Permissions.ADMINISTRATOR];
  priority = -1;
  type = guildAllowlistType;

  // add only variable (to only clear that type)
  async run(context: Command.Context, args: CommandArgs) {
    const guildId = context.guildId as string;

    const embed = new Embed();
    embed.setAuthor(String(context.user), context.user.avatarUrl, context.user.jumpLink);
    embed.setColor(EmbedColors.DEFAULT);
    if (args.only) {
      embed.setTitle('WIP');
      embed.setDescription(args.only);
    } else {
      embed.setTitle('Cleared Allowlist');
      embed.setDescription('Cleared out the entire Allowlist of this guild.');
      embed.setFooter('Allowlist');

      const settings = await editGuildSettings(context, guildId, {allowlist: []});
      GuildSettingsStore.set(guildId, settings);
    }

    return context.editOrReply({embed});
  }
}