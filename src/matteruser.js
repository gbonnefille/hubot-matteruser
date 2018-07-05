// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Robot,Adapter,TextMessage,User,EnterMessage,LeaveMessage} = require('hubot');

const MatterMostClient = require('mattermost-client');

class AttachmentMessage extends TextMessage {

    constructor(user, text, file_ids, id) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
          eval(`${thisName} = this;`);
        }
        this.user = user;
        this.text = text;
        this.file_ids = file_ids;
        this.id = id;
        super(this.user, this.text, this.id);
    }
}

// A TextMessage class that adds `msg.props` for Mattermost's properties.
//
// Text fields from message attachments are appended in @text for matching.
// <https://docs.mattermost.com/developer/message-attachments.html>
// The result is that `bot.hear()` will match against these attachment fields.
//
// As well, it is possible that some bot handlers could make use of other
// fields on `msg.props`.
//
// Example raw props:
//   {
//       "attachments": [...],
//       "from_webhook": "true",
//       "override_username": "trenthere"
//   }
class TextAndPropsMessage extends TextMessage {

    constructor(user, text, props, id) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
          eval(`${thisName} = this;`);
        }
        this.user = user;
        this.text = text;
        this.props = props;
        this.id = id;
        this.origText = this.text;
        if (this.props.attachments != null) {
            const separator = '\n\n--\n\n';
            for (let attachment of Array.from(this.props.attachments)) {
                const parts = [];
                for (let field of ['pretext', 'title', 'text']) {
                    if (attachment[field]) {
                        parts.push(attachment[field]);
                    }
                }
                if (parts.length) {
                    this.text += separator + parts.join('\n\n');
                }
            }
        }

        super(this.user, this.text, this.id);
    }

    match(regex) {
        return this.text.match(regex);
    }
}

class Matteruser extends Adapter {

    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
          eval(`${thisName} = this;`);
        }
        this.open = this.open.bind(this);
        this.error = this.error.bind(this);
        this.onConnected = this.onConnected.bind(this);
        this.onHello = this.onHello.bind(this);
        this.userChange = this.userChange.bind(this);
        this.loggedIn = this.loggedIn.bind(this);
        this.profilesLoaded = this.profilesLoaded.bind(this);
        this.brainLoaded = this.brainLoaded.bind(this);
        this.message = this.message.bind(this);
        this.userTyping = this.userTyping.bind(this);
        this.userAdded = this.userAdded.bind(this);
        this.userRemoved = this.userRemoved.bind(this);
        this.slackAttachmentMessage = this.slackAttachmentMessage.bind(this);
        super(...args);
    }

    run() {
        const mmHost = process.env.MATTERMOST_HOST;
        const mmUser = process.env.MATTERMOST_USER;
        const mmPassword = process.env.MATTERMOST_PASSWORD;
        const mmGroup = process.env.MATTERMOST_GROUP;
        const mmWSSPort = process.env.MATTERMOST_WSS_PORT || '443';
        const mmHTTPPort = process.env.MATTERMOST_HTTP_PORT || null;
        this.mmNoReply = process.env.MATTERMOST_REPLY === 'false';
        this.mmIgnoreUsers = (process.env.MATTERMOST_IGNORE_USERS != null ? process.env.MATTERMOST_IGNORE_USERS.split(',') : undefined) || [];

        if (mmHost == null) {
            this.robot.logger.emergency("MATTERMOST_HOST is required");
            process.exit(1);
        }
        if (mmUser == null) {
            this.robot.logger.emergency("MATTERMOST_USER is required");
            process.exit(1);
        }
        if (mmPassword == null) {
            this.robot.logger.emergency("MATTERMOST_PASSWORD is required");
            process.exit(1);
        }
        if (mmGroup == null) {
            this.robot.logger.emergency("MATTERMOST_GROUP is required");
            process.exit(1);
        }

        this.client = new MatterMostClient(mmHost, mmGroup, mmUser, mmPassword, {wssPort: mmWSSPort, httpPort: mmHTTPPort, pingInterval: 30000});

        this.client.on('open', this.open);
        this.client.on('hello', this.onHello);
        this.client.on('loggedIn', this.loggedIn);
        this.client.on('connected', this.onConnected);
        this.client.on('message', this.message);
        this.client.on('profilesLoaded', this.profilesLoaded);
        this.client.on('user_added', this.userAdded);
        this.client.on('user_removed', this.userRemoved);
        this.client.on('typing', this.userTyping);
        this.client.on('error', this.error);

        this.robot.brain.on('loaded', this.brainLoaded);

        this.robot.on('slack-attachment', this.slackAttachmentMessage);
        this.robot.on('slack.attachment', this.slackAttachmentMessage);

        return this.client.login();
    }

    open() {
        return true;
    }

    error(err) {
        this.robot.logger.info(`Error: ${err}`);
        return true;
    }

    onConnected() {
        this.robot.logger.info('Connected to Mattermost.');
        this.emit('connected');
        return true;
    }

    onHello(event) {
        this.robot.logger.info(`Mattermost server: ${event.data.server_version}`);
        return true;
    }

    userChange(user) {
        let value;
        if ((user != null ? user.id : undefined) == null) { return; }
        this.robot.logger.debug(`Adding user ${user.id}`);
        const newUser = {
            name: user.username,
            real_name: `${user.first_name} ${user.last_name}`,
            email_address: user.email,
            mm: {}
        };
        // Preserve the DM channel ID if it exists
        newUser.mm.dm_channel_id = __guard__(this.robot.brain.userForId(user.id).mm, x => x.dm_channel_id);
        for (var key in user) {
            value = user[key];
            newUser.mm[key] = value;
        }
        if (user.id in this.robot.brain.data.users) {
            for (key in this.robot.brain.data.users[user.id]) {
                value = this.robot.brain.data.users[user.id][key];
                if (!(key in newUser)) {
                    newUser[key] = value;
                }
            }
        }
        delete this.robot.brain.data.users[user.id];
        return this.robot.brain.userForId(user.id, newUser);
    }

    loggedIn(user) {
        this.robot.logger.info(`Logged in as user "${user.username}" but not connected yet.`);
        this.self = user;
        return true;
    }

    profilesLoaded(profiles) {
        return (() => {
            const result = [];
            for (let id in profiles) {
                const user = profiles[id];
                result.push(this.userChange(user));
            }
            return result;
        })();
    }

    brainLoaded() {
        this.robot.logger.info('Brain loaded');
        for (let id in this.client.users) {
            const user = this.client.users[id];
            this.userChange(user);
        }
        return true;
    }

    send(envelope, ...strings) {
        // Check if the target room is also a user's username
        let str;
        const user = this.robot.brain.userForName(envelope.room);

        // If it's not, continue as normal
        if (!user) {
            const channel = this.client.findChannelByName(envelope.room);
            for (str of Array.from(strings)) { this.client.postMessage(str, (channel != null ? channel.id : undefined) || envelope.room); }
            return;
        }

        // If it is, we assume they want to DM that user
        // Message their DM channel ID if it already exists.
        if ((user.mm != null ? user.mm.dm_channel_id : undefined) != null) {
            for (str of Array.from(strings)) { this.client.postMessage(str, user.mm.dm_channel_id); }
            return;
        }

        // Otherwise, create a new DM channel ID and message it.
        return this.client.getUserDirectMessageChannel(user.id, channel => {
            if (user.mm == null) { user.mm = {}; }
            user.mm.dm_channel_id = channel.id;
            return (() => {
                const result = [];
                for (str of Array.from(strings)) {
                    result.push(this.client.postMessage(str, channel.id));
                }
                return result;
            })();
        });
    }

    reply(envelope, ...strings) {
        if (this.mmNoReply) {
          return this.send(envelope, ...Array.from(strings));
      }

        strings = strings.map(s => `@${envelope.user.name} ${s}`);
        const postData = {};
        postData.message = strings[0];

        // Set the comment relationship
        postData.root_id = envelope.message.id;
        postData.parent_id = postData.root_id;

        postData.create_at = 0;
        postData.user_id = this.self.id;
        postData.filename = [];
        // Check if the target room is also a user's username
        const user = this.robot.brain.userForName(envelope.room);

        // If it's not, continue as normal
        if (!user) {
            const channel = this.client.findChannelByName(envelope.room);
            postData.channel_id = (channel != null ? channel.id : undefined) || envelope.room;
            this.client.customMessage(postData, postData.channel_id);
            return;
        }

        // If it is, we assume they want to DM that user
        // Message their DM channel ID if it already exists.
        if ((user.mm != null ? user.mm.dm_channel_id : undefined) != null) {
            postData.channel_id = user.mm.dm_channel_id;
            this.client.customMessage(postData, postData.channel_id);
            return;
        }

        // Otherwise, create a new DM channel ID and message it.
        return this.client.getUserDirectMessageChannel(user.id, channel => {
            if (user.mm == null) { user.mm = {}; }
            user.mm.dm_channel_id = channel.id;
            postData.channel_id = channel.id;
            return this.client.customMessage(postData, postData.channel_id);
        });
    }

    message(msg) {
        if (Array.from(this.mmIgnoreUsers).includes(msg.data.sender_name)) {
          this.robot.logger.info(`User ${msg.data.sender_name} is in MATTERMOST_IGNORE_USERS, ignoring them.`);
          return;
      }

        this.robot.logger.debug(msg);
        const mmPost = JSON.parse(msg.data.post);
        const mmUser = this.client.getUserByID(mmPost.user_id);
        if (mmPost.user_id === this.self.id) { return; } // Ignore our own output
        this.robot.logger.debug(`From: ${mmPost.user_id}, To: ${this.self.id}`);

        const user = this.robot.brain.userForId(mmPost.user_id);
        user.room = mmPost.channel_id;
        user.room_name = msg.data.channel_display_name;
        user.channel_type = msg.data.channel_type;
        
        let text = mmPost.message;
        if (msg.data.channel_type === 'D') {
          if (!new RegExp(`^@?${this.robot.name}`, 'i').test(text)) { // Direct message
            text = `${this.robot.name} ${text}`;
        }
          if (user.mm == null) { user.mm = {}; }
          user.mm.dm_channel_id = mmPost.channel_id;
      }
        this.robot.logger.debug(`Text: ${text}`);

        if (mmPost.file_ids != null) {
            this.receive(new AttachmentMessage(user, text, mmPost.file_ids, mmPost.id));
        // If there are interesting props, then include them for bot handlers.
        } else if ((mmPost.props != null ? mmPost.props.attachments : undefined) != null) {
            this.receive(new TextAndPropsMessage(user, text, mmPost.props, mmPost.id));
        } else {
            this.receive(new TextMessage(user, text, mmPost.id));
        }
        this.robot.logger.debug("Message sent to hubot brain.");
        return true;
    }

    userTyping(msg) {
        this.robot.logger.info('Someone is typing...');
        return true;
    }

    userAdded(msg) {
        // update channels when this bot is added to a new channel
        if (msg.data.user_id === this.self.id) {
          this.client.loadChannels();
      }
        try {
          const mmUser = this.client.getUserByID(msg.data.user_id);
          this.userChange(mmUser);
          const user = this.robot.brain.userForId(mmUser.id);
          user.room = msg.broadcast.channel_id;
          this.receive(new EnterMessage(user));
          return true;
        } catch (error) {
          return false;
      }
    }

    userRemoved(msg) {
        // update channels when this bot is removed from a channel
        if (msg.broadcast.user_id === this.self.id) {
          this.client.loadChannels();
      }
        try {
          const mmUser = this.client.getUserByID(msg.data.user_id);
          const user = this.robot.brain.userForId(mmUser.id);
          user.room = msg.broadcast.channel_id;
          this.receive(new LeaveMessage(user));
          return true;
        } catch (error) {
          return false;
      }
    }

    slackAttachmentMessage(data) {
        if (!data.room) { return; }

        // Convert data.room to channel_id in case it's a room name
        const channelInfo = this.client.findChannelByName(data.room);
        if (channelInfo !== null) {
            data.room = channelInfo.id;
        }
        const msg = {};
        msg.text = data.text;
        msg.type = "slack_attachment";
        msg.props = {};
        msg.channel_id = data.room;
        msg.props.attachments = data.attachments || [];
        if (!Array.isArray(msg.props.attachments)) { msg.props.attachments = [msg.props.attachments]; }
        if (data.username && (data.username !== this.robot.name)) {
            msg.as_user = false;
            msg.username = data.username;
            if (data.icon_url != null) {
                msg.icon_url = data.icon_url;
            } else if (data.icon_emoji != null) {
                msg.icon_emoji = data.icon_emoji;
            }
        } else {
            msg.as_user = true;
        }

        return this.client.customMessage(msg, msg.channel_id);
    }

    changeHeader(channel, header) {
        if (channel == null) { return; }
        if (header == null) { return; }

        const channelInfo = this.client.findChannelByName(channel);

        if (channelInfo == null) { return this.robot.logger.error("Channel not found"); }

        return this.client.setChannelHeader(channelInfo.id, header);
    }
}

exports.use = robot => new Matteruser(robot);

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}