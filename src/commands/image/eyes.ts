import { Command } from 'detritus-client';

import { imageEyes } from '../../api';
import { CommandTypes, ImageEyeTypes } from '../../constants';
import { imageReply } from '../../utils';

import { BaseImageCommand } from '../basecommand';


export interface CommandArgsBefore {
  url?: null | string,
}

export interface CommandArgs {
  url: string,
}

export default class EyesCommand extends BaseImageCommand<CommandArgs> {
  aliases = ['eye'];
  name = 'eyes';

  args = [
    {name: 'type', choices: Object.values(ImageEyeTypes), help: `Must be one of: (${Object.values(ImageEyeTypes).join(', ')})`},
  ];
  metadata = {
    description: 'Attach eyes to an image',
    examples: ['eyes', 'eyes https://i.imgur.com/WwiO7Bx.jpg', 'eyes https://i.imgur.com/WwiO7Bx.jpg -type spongebob'],
    type: CommandTypes.IMAGE,
    usage: 'eyes ?<emoji|id|mention|name|url> (-type <ImageEyeType>)',
  };
  priority = -1;

  async run(context: Command.Context, args: CommandArgs) {
    const response = await imageEyes(context, args);
    return imageReply(context, response);
  }
}
