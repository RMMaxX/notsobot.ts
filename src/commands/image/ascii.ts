import { Command } from 'detritus-client';

import { CommandTypes } from '../../constants';
import { BaseCommand } from '../basecommand';


export interface CommandArgsBefore {
  
}

export interface CommandArgs {

}

export default class AsciiCommand extends BaseCommand {
  name = 'ascii';

  metadata = {
    type: CommandTypes.IMAGE,
  };

  run(context: Command.Context, args: CommandArgs) {

  }
}
