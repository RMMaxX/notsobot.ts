import { ClusterClient, Command, GatewayClientEvents } from 'detritus-client';
import { EventSubscription } from 'detritus-utils';

import { Store } from './store';

import { putGuildSettings } from '../api';
import { GuildSettings } from '../api/structures/guildsettings';
import { RedisChannels } from '../constants';
import { RedisSpewer } from '../redis';
import { RedisPayloads } from '../types';


// Stores Guild Settings
class GuildSettingsStore extends Store<string, GuildSettings> {
  constructor() {
    // 2 hours
    super({expire: 2 * 60 * 60 * 1000});
  }

  insert(payload: GuildSettings): void {
    this.set(payload.id, payload);
  }

  async getOrFetch(context: Command.Context, guildId: string): Promise<GuildSettings | null> {
    let settings: GuildSettings | null = null;
    if (GuildSettingsPromisesStore.has(guildId)) {
      const promise = GuildSettingsPromisesStore.get(guildId) as GuildSettingsPromise;
      settings = await promise;
    } else {
      if (this.has(guildId)) {
        settings = this.get(guildId) as GuildSettings;
      } else {
        settings = await this.fetch(context, guildId);
      }
    }
    return settings;
  }

  async fetch(context: Command.Context, guildId: string): Promise<GuildSettings | null> {
    let settings: GuildSettings | null = null;
    if (GuildSettingsPromisesStore.has(guildId)) {
      const promise = GuildSettingsPromisesStore.get(guildId) as GuildSettingsPromise;
      settings = await promise;
    } else {
      const promise: GuildSettingsPromise = new Promise(async (resolve) => {
        const guild = context.guild;
        try {
          const settings = await putGuildSettings(context, guildId, {
            icon: (guild) ? guild.icon : null,
            name: (guild) ? guild.name : '',
          });
          resolve(settings);
        } catch(error) {
          resolve(null);
        }
        GuildSettingsPromisesStore.delete(guildId);
      });
      GuildSettingsPromisesStore.set(guildId, promise);
      settings = await promise;
    }
    return settings;
  }

  create(cluster: ClusterClient, redis: RedisSpewer) {
    const subscriptions: Array<EventSubscription> = [];
    {
      const subscription = cluster.subscribe('guildDelete', (event: GatewayClientEvents.GuildDelete) => {
        const { guildId } = event;
        this.delete(guildId);
      });
      subscriptions.push(subscription);
    }
    {
      const subscription = redis.subscribe(RedisChannels.GUILD_ALLOWLIST_UPDATE, (payload: RedisPayloads.GuildAllowlistUpdate) => {
        if (this.has(payload.id)) {
          const settings = this.get(payload.id) as GuildSettings;
          settings.merge(payload);
        }
      });
      subscriptions.push(subscription);
    }
    {
      const subscription = redis.subscribe(RedisChannels.GUILD_BLOCKLIST_UPDATE, (payload: RedisPayloads.GuildBlocklistUpdate) => {
        if (this.has(payload.id)) {
          const settings = this.get(payload.id) as GuildSettings;
          settings.merge(payload);
        }
      });
      subscriptions.push(subscription);
    }
    {
      const subscription = redis.subscribe(RedisChannels.GUILD_DISABLED_COMMAND_UPDATE, (payload: RedisPayloads.GuildDisabledCommandUpdate) => {
        if (this.has(payload.id)) {
          const settings = this.get(payload.id) as GuildSettings;
          settings.merge(payload);
        }
      });
      subscriptions.push(subscription);
    }
    {
      const subscription = redis.subscribe(RedisChannels.GUILD_PREFIX_UPDATE, (payload: RedisPayloads.GuildPrefixUpdate) => {
        if (this.has(payload.id)) {
          const settings = this.get(payload.id) as GuildSettings;
          settings.merge(payload);
        }
      });
      subscriptions.push(subscription);
    }
    {
      const subscription = redis.subscribe(RedisChannels.GUILD_SETTINGS_UPDATE, (payload: RedisPayloads.GuildSettingsUpdate) => {
        if (this.has(payload.id)) {
          const settings = this.get(payload.id) as GuildSettings;
          settings.merge(payload);
        }
      });
      subscriptions.push(subscription);
    }
    return subscriptions;
  }
}

export default new GuildSettingsStore();



export type GuildSettingsPromise = Promise<GuildSettings | null>;

class GuildSettingsPromises extends Store<string, GuildSettingsPromise> {
  insert(guildId: string, promise: GuildSettingsPromise): void {
    this.set(guildId, promise);
  }
}

export const GuildSettingsPromisesStore = new GuildSettingsPromises();
