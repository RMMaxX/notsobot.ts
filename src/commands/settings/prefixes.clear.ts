import { Command } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';

import { editGuildSettings } from '../../api';
import { CommandTypes, EmbedColors } from '../../constants';
import { createUserEmbed } from '../../utils';

import { BaseCommand } from '../basecommand';

import { formatPrefixes } from './prefixes';


export default class PrefixesClearCommand extends BaseCommand {
  aliases = ['prefix clear'];
  name = 'prefixes clear';

  disableDm = true;
  metadata = {
    description: 'Clear all custom prefixes from the guild. (Bot Mentions will always override this)',
    examples: [
      'prefixes clear',
    ],
    type: CommandTypes.SETTINGS,
    usage: 'prefixes clear',
  };
  permissionsClient = [Permissions.EMBED_LINKS];
  permissions = [Permissions.MANAGE_GUILD];

  async run(context: Command.Context) {
    const guildId = context.guildId as string;

    const embed = createUserEmbed(context.user);
    embed.setColor(EmbedColors.DEFAULT);
    embed.setTitle('Cleared prefixes');

    const { prefixes } = await editGuildSettings(context, guildId, {prefixes: []});
    formatPrefixes(context, prefixes, embed);

    return context.editOrReply({embed});
  }
}
