import { Command, Constants } from 'detritus-client';
import { LocalesText, Permissions } from 'detritus-client/lib/constants';

import { CommandTypes } from '../../constants';
import { Arguments } from '../../utils';

import { BaseCommand } from '../basecommand';


export interface CommandArgsBefore {
  locale: Constants.Locales | undefined,
}

export interface CommandArgs {
  locale: Constants.Locales,
}

export default class SetLocaleCommand extends BaseCommand {
  aliases = ['set language'];
  name = 'set locale';

  disableDm = true;
  label = 'locale';
  metadata = {
    description: 'Set the guild\'s locale preference.',
    examples: [
      'set locale en-us',
      'set locale english',
    ],
    type: CommandTypes.SETTINGS,
    usage: 'set locale <locale>',
  };
  permissionsClient = [Permissions.MANAGE_GUILD];
  permissions = [Permissions.MANAGE_GUILD];
  type = Arguments.DiscordLocale.type!;

  onBeforeRun(context: Command.Context, args: CommandArgsBefore) {
    return !!args.locale;
  }

  onCancelRun(context: Command.Context, args: CommandArgsBefore) {
    return context.editOrReply('⚠ Provide some kind of locale');
  }

  async run(context: Command.Context, args: CommandArgs) {
    const guild = context.guild;
    if (guild) {
      await guild.edit({preferredLocale: args.locale});

      let locale: string;
      if (args.locale in LocalesText) {
        locale = LocalesText[args.locale];
      } else {
        locale = args.locale;
      }
      return context.editOrReply(`Successfully changed the guild\'s locale to ${locale}`);
    }
  }
}
