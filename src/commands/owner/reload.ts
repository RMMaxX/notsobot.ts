import { ClusterClient, Command, CommandClient, ShardClient } from 'detritus-client';

import { DIRECTORY } from '../../../config.json';

import { NotSoClient } from '../../client';
import { CommandTypes } from '../../constants';
import { Store } from '../../stores';

import { BaseCommand } from '../basecommand';



async function reloadCommands(
  cluster: ClusterClient,
  refreshStores: boolean,
  LIB_PATH: string,
): Promise<Array<number>> {
  const STORE_PATH = '/stores/';

  const IGNORE = ['/bot.', '/redis.'];

  for (let key in require.cache) {
    if (!key.includes(LIB_PATH)) {
      continue;
    }
    if (IGNORE.some((file) => key.includes(file))) {
      continue;
    }

    if (key.includes(STORE_PATH)) {
      if (!refreshStores) {
        continue;
      }
      // get the old store and stop it
      const oldStoreModule = require(key);
      if (oldStoreModule.default) {
        const { default: oldStore } = oldStoreModule;
        oldStore.stop(cluster);

        // delete old store module
        delete require.cache[key];

        // re-fetch the new store object
        const newStoreModule = require(key);
        const { default: newStore } = newStoreModule;

        // set the cache back to the old store
        require.cache[key].exports = oldStoreModule;

        // set the old store's functions to the new store's
        for (let key of Object.getOwnPropertyNames(newStore.constructor.prototype)) {
          if (key !== 'constructor' && typeof(newStore[key]) === 'function') {
            oldStore[key] = newStore.constructor.prototype[key].bind(oldStore);
          }
        }

        // reconnect it
        oldStore.connect(cluster);
      }
      // do nothing since it's just /index.ts and /store.ts
    } else {
      delete require.cache[key];
    }
  }
  if (cluster.commandClient) {
    const commandClient = cluster.commandClient as NotSoClient;
    await commandClient.resetCommands();
  }
  return cluster.shards.map((shard: ShardClient) => shard.shardId);
}

export interface CommandArgs {
  stores: boolean,
}

export default class ReloadCommand extends BaseCommand {
  aliases = ['refresh'];
  name = 'reload';

  args = [
    {name: 'stores', type: Boolean},
  ];
  metadata = {
    description: 'Reload the bot\'s commands.',
    examples: ['refresh', 'refresh -stores'],
    type: CommandTypes.OWNER,
    usage: 'refresh',
  };
  responseOptional = true;

  onBefore(context: Command.Context) {
    return context.user.isClientOwner;
  }

  async run(context: Command.Context, args: CommandArgs) {
    if (!context.manager) {
      return context.editOrReply('no cluster manager found');
    }
    const message = await context.editOrReply('ok, refreshing...');
    const shardIds = await context.manager.broadcastEval(reloadCommands, args.stores, DIRECTORY);

    const error = shardIds.find((shardId: any) => shardId instanceof Error);
    if (error) {
      if (error.errors) {
        return message.edit(`${error.message} (${JSON.stringify(error.errors)})`);
      }
      return message.edit(`Error: ${error.message}`);
    }
    return message.edit(`ok, refreshed commands on ${shardIds.flat().length} shards.`);
  }
}
