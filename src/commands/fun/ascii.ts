import { Command } from 'detritus-client';
import { Embed, Markup } from 'detritus-client/lib/utils';

import { funASCII } from '../../api';
import { CommandTypes } from '../../constants';
import { imageReplyFromOptions } from '../../utils';

import { BaseCommand } from '../basecommand';


export interface CommandArgsBefore {
  text: string,
}

export interface CommandArgs {
  text: string,
}

export default class AsciiCommand extends BaseCommand {
  name = 'ascii';

  label = 'text';
  metadata = {
    description: 'Convert text to an ASCII Image',
    examples: [
      'ascii NotSoBot',
    ],
    type: CommandTypes.FUN,
    usage: 'ascii <text>',
  };

  onBeforeRun(context: Command.Context, args: CommandArgsBefore) {
    return !!args.text;
  }

  onCancelRun(context: Command.Context, args: CommandArgsBefore) {
    return context.editOrReply('Provide some text.');
  }

  async run(context: Command.Context, args: CommandArgs) {
    const { image, text } = await funASCII(context, args);

    let content: string | undefined;
    if (text.length <= 560) {
      content = Markup.codeblock(text, {language: 'fix'});
    }

    const value = Buffer.from(image.data, 'base64');
    return imageReplyFromOptions(context, value, {
      content,
      filename: image.details.filename,
      height: image.details.height,
      size: value.length,
      width: image.details.width,
    });
  }
}
