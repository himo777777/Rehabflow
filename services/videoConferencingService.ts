/**
 * VideoConferencingService - Sprint 5.25
 *
 * Videokonferens för RehabFlow med:
 * - Rumshantering
 * - Deltagarlista
 * - Layout-hantering
 * - Chat integration
 * - Inspelning
 * - Virtuella bakgrunder
 * - Reaktioner och handuppräckning
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RoomState = 'waiting' | 'active' | 'ended';
export type ParticipantRole = 'host' | 'co-host' | 'participant' | 'viewer';
export type LayoutMode = 'grid' | 'spotlight' | 'sidebar' | 'presentation';
export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export interface Room {
  id: string;
  name: string;
  state: RoomState;
  hostId: string;
  participants: Map<string, Participant>;
  settings: RoomSettings;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface RoomSettings {
  maxParticipants: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  muteOnJoin: boolean;
  videoOffOnJoin: boolean;
  waitingRoom: boolean;
  requirePassword: boolean;
  password?: string;
  allowReactions: boolean;
  allowHandRaise: boolean;
  autoRecord: boolean;
  allowVirtualBackground: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  joinedAt: number;
  connectionQuality: ConnectionQuality;
  virtualBackground?: VirtualBackground;
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export interface VirtualBackground {
  type: 'blur' | 'image' | 'video' | 'none';
  source?: string;
  blurIntensity?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'file' | 'system';
  timestamp: number;
  replyTo?: string;
  reactions?: Map<string, string[]>;
}

export interface Reaction {
  type: string;
  emoji: string;
  participantId: string;
  timestamp: number;
}

export interface Recording {
  id: string;
  roomId: string;
  state: RecordingState;
  startedAt?: number;
  duration: number;
  size: number;
  url?: string;
  participants: string[];
}

export interface LayoutConfig {
  mode: LayoutMode;
  spotlightParticipantId?: string;
  pinnedParticipants?: string[];
  hiddenParticipants?: string[];
  showNames?: boolean;
  showAudioIndicator?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface ConferenceEvent {
  type: string;
  roomId: string;
  participantId?: string;
  data?: unknown;
  timestamp: number;
}

export interface JoinOptions {
  audio?: boolean;
  video?: boolean;
  displayName: string;
  avatar?: string;
  virtualBackground?: VirtualBackground;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  maxParticipants: number;
  autoClose: boolean;
  timer?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  isOpen: boolean;
  createdBy: string;
  createdAt: number;
  votes: Map<string, string[]>;
}

export interface Whiteboard {
  id: string;
  roomId: string;
  strokes: WhiteboardStroke[];
  participants: Set<string>;
}

export interface WhiteboardStroke {
  id: string;
  participantId: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
  timestamp: number;
}

// ============================================================================
// VIDEO CONFERENCING SERVICE
// ============================================================================

class VideoConferencingService {
  private static instance: VideoConferencingService;

  private rooms: Map<string, Room> = new Map();
  private currentRoom: Room | null = null;
  private currentParticipantId: string = '';
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private recordings: Map<string, Recording> = new Map();
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private layoutConfig: LayoutConfig = { mode: 'grid' };
  private breakoutRooms: Map<string, BreakoutRoom> = new Map();
  private polls: Map<string, Poll> = new Map();
  private whiteboards: Map<string, Whiteboard> = new Map();
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private speakingDetectionInterval: ReturnType<typeof setInterval> | null = null;
  private audioContexts: Map<string, AudioContext> = new Map();
  private analyzers: Map<string, AnalyserNode> = new Map();

  private constructor() {}

  public static getInstance(): VideoConferencingService {
    if (!VideoConferencingService.instance) {
      VideoConferencingService.instance = new VideoConferencingService();
    }
    return VideoConferencingService.instance;
  }

  // ============================================================================
  // ROOM MANAGEMENT
  // ============================================================================

  /**
   * Skapa nytt rum
   */
  public createRoom(name: string, settings: Partial<RoomSettings> = {}): Room {
    const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const room: Room = {
      id,
      name,
      state: 'waiting',
      hostId: this.currentParticipantId,
      participants: new Map(),
      settings: {
        maxParticipants: 100,
        allowChat: true,
        allowScreenShare: true,
        allowRecording: false,
        muteOnJoin: false,
        videoOffOnJoin: false,
        waitingRoom: false,
        requirePassword: false,
        allowReactions: true,
        allowHandRaise: true,
        autoRecord: false,
        allowVirtualBackground: true,
        ...settings
      },
      createdAt: Date.now()
    };

    this.rooms.set(id, room);
    this.chatMessages.set(id, []);
    this.emit('roomCreated', { room });

    return room;
  }

  /**
   * Gå med i rum
   */
  public async joinRoom(
    roomId: string,
    options: JoinOptions
  ): Promise<{ success: boolean; error?: string }> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Rum hittades inte' };
    }

    if (room.participants.size >= room.settings.maxParticipants) {
      return { success: false, error: 'Rummet är fullt' };
    }

    // Skapa participant
    const participantId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentParticipantId = participantId;

    const participant: Participant = {
      id: participantId,
      name: options.displayName,
      avatar: options.avatar,
      role: room.participants.size === 0 ? 'host' : 'participant',
      isAudioEnabled: options.audio !== false && !room.settings.muteOnJoin,
      isVideoEnabled: options.video !== false && !room.settings.videoOffOnJoin,
      isScreenSharing: false,
      isHandRaised: false,
      isSpeaking: false,
      joinedAt: Date.now(),
      connectionQuality: 'unknown',
      virtualBackground: options.virtualBackground
    };

    room.participants.set(participantId, participant);
    this.currentRoom = room;

    // Starta talet-detektering
    this.startSpeakingDetection();

    // Skicka system-meddelande
    this.addSystemMessage(roomId, `${options.displayName} gick med i mötet`);

    this.emit('participantJoined', { roomId, participant });

    // Starta automatisk inspelning om aktiverat
    if (room.settings.autoRecord && room.state !== 'active') {
      this.startRecording(roomId);
    }

    // Starta rummet om första deltagaren
    if (room.participants.size === 1) {
      this.startRoom(roomId);
    }

    return { success: true };
  }

  /**
   * Lämna rum
   */
  public leaveRoom(): void {
    if (!this.currentRoom || !this.currentParticipantId) return;

    const participant = this.currentRoom.participants.get(this.currentParticipantId);
    if (participant) {
      this.addSystemMessage(this.currentRoom.id, `${participant.name} lämnade mötet`);
    }

    this.currentRoom.participants.delete(this.currentParticipantId);

    // Om host lämnar, tilldela ny host
    if (this.currentRoom.hostId === this.currentParticipantId) {
      const newHost = this.currentRoom.participants.values().next().value;
      if (newHost) {
        this.currentRoom.hostId = newHost.id;
        newHost.role = 'host';
        this.addSystemMessage(this.currentRoom.id, `${newHost.name} är nu värd`);
      }
    }

    // Om inga deltagare, avsluta rummet
    if (this.currentRoom.participants.size === 0) {
      this.endRoom(this.currentRoom.id);
    }

    this.emit('participantLeft', {
      roomId: this.currentRoom.id,
      participantId: this.currentParticipantId
    });

    this.stopSpeakingDetection();
    this.currentRoom = null;
    this.currentParticipantId = '';
  }

  /**
   * Starta rum
   */
  public startRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'active';
    room.startedAt = Date.now();

    this.emit('roomStarted', { roomId });
  }

  /**
   * Avsluta rum
   */
  public endRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'ended';
    room.endedAt = Date.now();

    // Stoppa inspelning
    if (this.mediaRecorder?.state === 'recording') {
      this.stopRecording(roomId);
    }

    this.emit('roomEnded', { roomId });
  }

  /**
   * Hämta rum
   */
  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Hämta aktuellt rum
   */
  public getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  // ============================================================================
  // PARTICIPANT CONTROLS
  // ============================================================================

  /**
   * Muta/avmuta deltagare
   */
  public setParticipantAudio(participantId: string, enabled: boolean): void {
    if (!this.currentRoom) return;

    const participant = this.currentRoom.participants.get(participantId);
    if (participant) {
      participant.isAudioEnabled = enabled;
      this.emit('participantAudioChanged', {
        roomId: this.currentRoom.id,
        participantId,
        enabled
      });
    }
  }

  /**
   * Aktivera/avaktivera video
   */
  public setParticipantVideo(participantId: string, enabled: boolean): void {
    if (!this.currentRoom) return;

    const participant = this.currentRoom.participants.get(participantId);
    if (participant) {
      participant.isVideoEnabled = enabled;
      this.emit('participantVideoChanged', {
        roomId: this.currentRoom.id,
        participantId,
        enabled
      });
    }
  }

  /**
   * Räck upp handen
   */
  public raiseHand(participantId?: string): void {
    if (!this.currentRoom) return;

    const id = participantId || this.currentParticipantId;
    const participant = this.currentRoom.participants.get(id);

    if (participant) {
      participant.isHandRaised = !participant.isHandRaised;
      this.emit('handRaised', {
        roomId: this.currentRoom.id,
        participantId: id,
        raised: participant.isHandRaised
      });
    }
  }

  /**
   * Ändra roll
   */
  public setParticipantRole(participantId: string, role: ParticipantRole): void {
    if (!this.currentRoom) return;
    if (this.currentRoom.hostId !== this.currentParticipantId) return; // Endast host

    const participant = this.currentRoom.participants.get(participantId);
    if (participant) {
      participant.role = role;
      this.emit('participantRoleChanged', {
        roomId: this.currentRoom.id,
        participantId,
        role
      });
    }
  }

  /**
   * Kicka deltagare
   */
  public kickParticipant(participantId: string): void {
    if (!this.currentRoom) return;
    if (this.currentRoom.hostId !== this.currentParticipantId) return;

    const participant = this.currentRoom.participants.get(participantId);
    if (participant) {
      this.addSystemMessage(this.currentRoom.id, `${participant.name} blev borttagen från mötet`);
      this.currentRoom.participants.delete(participantId);
      this.emit('participantKicked', {
        roomId: this.currentRoom.id,
        participantId
      });
    }
  }

  /**
   * Muta alla
   */
  public muteAll(): void {
    if (!this.currentRoom) return;
    if (this.currentRoom.hostId !== this.currentParticipantId) return;

    for (const participant of this.currentRoom.participants.values()) {
      if (participant.id !== this.currentParticipantId) {
        participant.isAudioEnabled = false;
      }
    }

    this.addSystemMessage(this.currentRoom.id, 'Värden mutade alla deltagare');
    this.emit('allMuted', { roomId: this.currentRoom.id });
  }

  // ============================================================================
  // LAYOUT
  // ============================================================================

  /**
   * Sätt layout-läge
   */
  public setLayoutMode(mode: LayoutMode): void {
    this.layoutConfig.mode = mode;
    this.emit('layoutChanged', { layout: this.layoutConfig });
  }

  /**
   * Spotlight deltagare
   */
  public spotlightParticipant(participantId: string): void {
    this.layoutConfig.mode = 'spotlight';
    this.layoutConfig.spotlightParticipantId = participantId;
    this.emit('layoutChanged', { layout: this.layoutConfig });
  }

  /**
   * Pinna deltagare
   */
  public pinParticipant(participantId: string): void {
    if (!this.layoutConfig.pinnedParticipants) {
      this.layoutConfig.pinnedParticipants = [];
    }

    if (!this.layoutConfig.pinnedParticipants.includes(participantId)) {
      this.layoutConfig.pinnedParticipants.push(participantId);
      this.emit('layoutChanged', { layout: this.layoutConfig });
    }
  }

  /**
   * Avpinna deltagare
   */
  public unpinParticipant(participantId: string): void {
    if (this.layoutConfig.pinnedParticipants) {
      this.layoutConfig.pinnedParticipants = this.layoutConfig.pinnedParticipants.filter(
        id => id !== participantId
      );
      this.emit('layoutChanged', { layout: this.layoutConfig });
    }
  }

  /**
   * Hämta layout
   */
  public getLayout(): LayoutConfig {
    return this.layoutConfig;
  }

  // ============================================================================
  // CHAT
  // ============================================================================

  /**
   * Skicka chattmeddelande
   */
  public sendMessage(content: string, replyTo?: string): ChatMessage | null {
    if (!this.currentRoom) return null;

    const participant = this.currentRoom.participants.get(this.currentParticipantId);
    if (!participant) return null;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: this.currentRoom.id,
      senderId: this.currentParticipantId,
      senderName: participant.name,
      content,
      type: 'text',
      timestamp: Date.now(),
      replyTo,
      reactions: new Map()
    };

    const messages = this.chatMessages.get(this.currentRoom.id) || [];
    messages.push(message);
    this.chatMessages.set(this.currentRoom.id, messages);

    this.emit('messageReceived', { roomId: this.currentRoom.id, message });

    return message;
  }

  /**
   * Skicka fil
   */
  public sendFile(file: File): ChatMessage | null {
    if (!this.currentRoom) return null;

    const participant = this.currentRoom.participants.get(this.currentParticipantId);
    if (!participant) return null;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: this.currentRoom.id,
      senderId: this.currentParticipantId,
      senderName: participant.name,
      content: file.name,
      type: 'file',
      timestamp: Date.now()
    };

    const messages = this.chatMessages.get(this.currentRoom.id) || [];
    messages.push(message);
    this.chatMessages.set(this.currentRoom.id, messages);

    this.emit('messageReceived', { roomId: this.currentRoom.id, message });

    return message;
  }

  /**
   * Reagera på meddelande
   */
  public reactToMessage(messageId: string, emoji: string): void {
    if (!this.currentRoom) return;

    const messages = this.chatMessages.get(this.currentRoom.id) || [];
    const message = messages.find(m => m.id === messageId);

    if (message) {
      if (!message.reactions) {
        message.reactions = new Map();
      }

      const reactors = message.reactions.get(emoji) || [];
      if (!reactors.includes(this.currentParticipantId)) {
        reactors.push(this.currentParticipantId);
        message.reactions.set(emoji, reactors);
        this.emit('messageReacted', { roomId: this.currentRoom.id, messageId, emoji });
      }
    }
  }

  private addSystemMessage(roomId: string, content: string): void {
    const message: ChatMessage = {
      id: `sys_${Date.now()}`,
      roomId,
      senderId: 'system',
      senderName: 'System',
      content,
      type: 'system',
      timestamp: Date.now()
    };

    const messages = this.chatMessages.get(roomId) || [];
    messages.push(message);
    this.chatMessages.set(roomId, messages);

    this.emit('messageReceived', { roomId, message });
  }

  /**
   * Hämta chattmeddelanden
   */
  public getMessages(roomId: string): ChatMessage[] {
    return this.chatMessages.get(roomId) || [];
  }

  // ============================================================================
  // REACTIONS
  // ============================================================================

  /**
   * Skicka reaktion
   */
  public sendReaction(type: string, emoji: string): void {
    if (!this.currentRoom) return;

    const reaction: Reaction = {
      type,
      emoji,
      participantId: this.currentParticipantId,
      timestamp: Date.now()
    };

    this.emit('reactionReceived', { roomId: this.currentRoom.id, reaction });
  }

  // ============================================================================
  // RECORDING
  // ============================================================================

  /**
   * Starta inspelning
   */
  public async startRecording(roomId: string): Promise<boolean> {
    if (!this.currentRoom?.settings.allowRecording) return false;

    try {
      // Kombinera alla strömmar
      const streams: MediaStream[] = [];
      for (const participant of this.currentRoom.participants.values()) {
        if (participant.stream) {
          streams.push(participant.stream);
        }
      }

      if (streams.length === 0) return false;

      // Skapa kombinerad ström
      const combinedStream = new MediaStream();
      streams.forEach(stream => {
        stream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      });

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording(roomId);
      };

      this.mediaRecorder.start(1000);

      const recording: Recording = {
        id: `rec_${Date.now()}`,
        roomId,
        state: 'recording',
        startedAt: Date.now(),
        duration: 0,
        size: 0,
        participants: Array.from(this.currentRoom.participants.keys())
      };

      this.recordings.set(recording.id, recording);

      this.addSystemMessage(roomId, 'Inspelning startad');
      this.emit('recordingStarted', { roomId, recording });

      return true;
    } catch (error) {
      console.error('Kunde inte starta inspelning:', error);
      return false;
    }
  }

  /**
   * Pausa inspelning
   */
  public pauseRecording(roomId: string): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();

      const recording = Array.from(this.recordings.values()).find(r => r.roomId === roomId);
      if (recording) {
        recording.state = 'paused';
      }

      this.emit('recordingPaused', { roomId });
    }
  }

  /**
   * Återuppta inspelning
   */
  public resumeRecording(roomId: string): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();

      const recording = Array.from(this.recordings.values()).find(r => r.roomId === roomId);
      if (recording) {
        recording.state = 'recording';
      }

      this.emit('recordingResumed', { roomId });
    }
  }

  /**
   * Stoppa inspelning
   */
  public stopRecording(roomId: string): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.addSystemMessage(roomId, 'Inspelning avslutad');
    }
  }

  private processRecording(roomId: string): void {
    const recording = Array.from(this.recordings.values()).find(r => r.roomId === roomId);
    if (!recording) return;

    recording.state = 'processing';

    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    recording.size = blob.size;
    recording.duration = recording.startedAt ? Date.now() - recording.startedAt : 0;
    recording.url = URL.createObjectURL(blob);

    this.emit('recordingReady', { roomId, recording });
  }

  // ============================================================================
  // VIRTUAL BACKGROUNDS
  // ============================================================================

  /**
   * Sätt virtuell bakgrund
   */
  public setVirtualBackground(config: VirtualBackground): void {
    if (!this.currentRoom || !this.currentRoom.settings.allowVirtualBackground) return;

    const participant = this.currentRoom.participants.get(this.currentParticipantId);
    if (participant) {
      participant.virtualBackground = config;
      this.emit('virtualBackgroundChanged', {
        roomId: this.currentRoom.id,
        participantId: this.currentParticipantId,
        background: config
      });
    }
  }

  /**
   * Ta bort virtuell bakgrund
   */
  public removeVirtualBackground(): void {
    this.setVirtualBackground({ type: 'none' });
  }

  // ============================================================================
  // BREAKOUT ROOMS
  // ============================================================================

  /**
   * Skapa breakout-rum
   */
  public createBreakoutRoom(name: string, maxParticipants: number = 10): BreakoutRoom {
    const breakout: BreakoutRoom = {
      id: `breakout_${Date.now()}`,
      name,
      participants: [],
      maxParticipants,
      autoClose: true
    };

    this.breakoutRooms.set(breakout.id, breakout);
    this.emit('breakoutRoomCreated', { breakout });

    return breakout;
  }

  /**
   * Tilldela deltagare till breakout-rum
   */
  public assignToBreakoutRoom(participantId: string, breakoutId: string): void {
    const breakout = this.breakoutRooms.get(breakoutId);
    if (!breakout) return;

    if (breakout.participants.length < breakout.maxParticipants) {
      // Ta bort från eventuellt annat breakout-rum
      for (const br of this.breakoutRooms.values()) {
        br.participants = br.participants.filter(p => p !== participantId);
      }

      breakout.participants.push(participantId);
      this.emit('participantAssignedToBreakout', {
        participantId,
        breakoutId
      });
    }
  }

  /**
   * Stäng breakout-rum
   */
  public closeBreakoutRoom(breakoutId: string): void {
    const breakout = this.breakoutRooms.get(breakoutId);
    if (!breakout) return;

    this.breakoutRooms.delete(breakoutId);
    this.emit('breakoutRoomClosed', { breakoutId, participants: breakout.participants });
  }

  // ============================================================================
  // POLLS
  // ============================================================================

  /**
   * Skapa omröstning
   */
  public createPoll(
    question: string,
    options: string[],
    isAnonymous: boolean = false,
    isMultipleChoice: boolean = false
  ): Poll {
    const poll: Poll = {
      id: `poll_${Date.now()}`,
      question,
      options: options.map((text, i) => ({ id: `opt_${i}`, text, votes: 0 })),
      isAnonymous,
      isMultipleChoice,
      isOpen: true,
      createdBy: this.currentParticipantId,
      createdAt: Date.now(),
      votes: new Map()
    };

    this.polls.set(poll.id, poll);
    this.emit('pollCreated', { roomId: this.currentRoom?.id, poll });

    return poll;
  }

  /**
   * Rösta i omröstning
   */
  public vote(pollId: string, optionIds: string[]): void {
    const poll = this.polls.get(pollId);
    if (!poll || !poll.isOpen) return;

    // Ta bort tidigare röst
    const previousVotes = poll.votes.get(this.currentParticipantId);
    if (previousVotes) {
      for (const optionId of previousVotes) {
        const option = poll.options.find(o => o.id === optionId);
        if (option) option.votes--;
      }
    }

    // Lägg till ny röst
    poll.votes.set(this.currentParticipantId, optionIds);
    for (const optionId of optionIds) {
      const option = poll.options.find(o => o.id === optionId);
      if (option) option.votes++;
    }

    this.emit('pollVoted', { pollId, participantId: this.currentParticipantId });
  }

  /**
   * Stäng omröstning
   */
  public closePoll(pollId: string): void {
    const poll = this.polls.get(pollId);
    if (poll) {
      poll.isOpen = false;
      this.emit('pollClosed', { pollId, results: poll.options });
    }
  }

  // ============================================================================
  // SPEAKING DETECTION
  // ============================================================================

  private startSpeakingDetection(): void {
    if (this.speakingDetectionInterval) return;

    this.speakingDetectionInterval = setInterval(() => {
      this.detectSpeaking();
    }, 100);
  }

  private stopSpeakingDetection(): void {
    if (this.speakingDetectionInterval) {
      clearInterval(this.speakingDetectionInterval);
      this.speakingDetectionInterval = null;
    }

    // Rensa audio contexts
    this.audioContexts.forEach(ctx => ctx.close());
    this.audioContexts.clear();
    this.analyzers.clear();
  }

  private detectSpeaking(): void {
    if (!this.currentRoom) return;

    for (const [participantId, participant] of this.currentRoom.participants) {
      if (!participant.stream || !participant.isAudioEnabled) {
        if (participant.isSpeaking) {
          participant.isSpeaking = false;
          this.emit('speakingChanged', { participantId, isSpeaking: false });
        }
        continue;
      }

      const analyzer = this.getOrCreateAnalyzer(participantId, participant.stream);
      if (!analyzer) continue;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const isSpeaking = average > 30;

      if (isSpeaking !== participant.isSpeaking) {
        participant.isSpeaking = isSpeaking;
        this.emit('speakingChanged', { participantId, isSpeaking });
      }
    }
  }

  private getOrCreateAnalyzer(participantId: string, stream: MediaStream): AnalyserNode | null {
    if (this.analyzers.has(participantId)) {
      return this.analyzers.get(participantId)!;
    }

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;

      source.connect(analyzer);

      this.audioContexts.set(participantId, audioContext);
      this.analyzers.set(participantId, analyzer);

      return analyzer;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  public on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook för rum
 */
export function useRoom(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const service = useMemo(() => VideoConferencingService.getInstance(), []);

  useEffect(() => {
    if (roomId) {
      setRoom(service.getRoom(roomId) || null);
    } else {
      setRoom(service.getCurrentRoom());
    }

    const updateParticipants = () => {
      const currentRoom = roomId ? service.getRoom(roomId) : service.getCurrentRoom();
      if (currentRoom) {
        setParticipants(Array.from(currentRoom.participants.values()));
      }
    };

    updateParticipants();

    const unsub1 = service.on('participantJoined', updateParticipants);
    const unsub2 = service.on('participantLeft', updateParticipants);

    return () => {
      unsub1();
      unsub2();
    };
  }, [roomId, service]);

  const createRoom = useCallback((name: string, settings?: Partial<RoomSettings>) => {
    return service.createRoom(name, settings);
  }, [service]);

  const joinRoom = useCallback((id: string, options: JoinOptions) => {
    return service.joinRoom(id, options);
  }, [service]);

  const leaveRoom = useCallback(() => {
    service.leaveRoom();
  }, [service]);

  return { room, participants, createRoom, joinRoom, leaveRoom };
}

/**
 * Hook för chattmeddelanden
 */
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const service = useMemo(() => VideoConferencingService.getInstance(), []);

  useEffect(() => {
    setMessages(service.getMessages(roomId));

    const unsubscribe = service.on('messageReceived', (data: unknown) => {
      const event = data as { roomId: string; message: ChatMessage };
      if (event.roomId === roomId) {
        setMessages(prev => [...prev, event.message]);
      }
    });

    return unsubscribe;
  }, [roomId, service]);

  const sendMessage = useCallback((content: string) => {
    return service.sendMessage(content);
  }, [service]);

  return { messages, sendMessage };
}

/**
 * Hook för layout
 */
export function useLayout() {
  const [layout, setLayout] = useState<LayoutConfig>({ mode: 'grid' });
  const service = useMemo(() => VideoConferencingService.getInstance(), []);

  useEffect(() => {
    setLayout(service.getLayout());

    const unsubscribe = service.on('layoutChanged', (data: unknown) => {
      setLayout((data as { layout: LayoutConfig }).layout);
    });

    return unsubscribe;
  }, [service]);

  const setMode = useCallback((mode: LayoutMode) => {
    service.setLayoutMode(mode);
  }, [service]);

  const spotlight = useCallback((participantId: string) => {
    service.spotlightParticipant(participantId);
  }, [service]);

  const pin = useCallback((participantId: string) => {
    service.pinParticipant(participantId);
  }, [service]);

  const unpin = useCallback((participantId: string) => {
    service.unpinParticipant(participantId);
  }, [service]);

  return { layout, setMode, spotlight, pin, unpin };
}

/**
 * Hook för inspelning
 */
export function useRecording(roomId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);
  const service = useMemo(() => VideoConferencingService.getInstance(), []);

  useEffect(() => {
    const unsub1 = service.on('recordingStarted', (data: unknown) => {
      const event = data as { roomId: string; recording: Recording };
      if (event.roomId === roomId) {
        setIsRecording(true);
        setRecording(event.recording);
      }
    });

    const unsub2 = service.on('recordingReady', (data: unknown) => {
      const event = data as { roomId: string; recording: Recording };
      if (event.roomId === roomId) {
        setIsRecording(false);
        setRecording(event.recording);
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [roomId, service]);

  const start = useCallback(() => service.startRecording(roomId), [roomId, service]);
  const pause = useCallback(() => service.pauseRecording(roomId), [roomId, service]);
  const resume = useCallback(() => service.resumeRecording(roomId), [roomId, service]);
  const stop = useCallback(() => service.stopRecording(roomId), [roomId, service]);

  return { isRecording, recording, start, pause, resume, stop };
}

// ============================================================================
// EXPORT
// ============================================================================

export const videoConferencingService = VideoConferencingService.getInstance();
export default videoConferencingService;
