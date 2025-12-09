/**
 * RTCService - Sprint 5.25
 *
 * Real-time Communication för RehabFlow med:
 * - WebRTC peer-to-peer
 * - Signaling server integration
 * - Audio/Video streams
 * - Screen sharing
 * - Data channels
 * - NAT traversal (STUN/TURN)
 * - Bandbreddhantering
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
export type SignalingState = 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';
export type MediaType = 'audio' | 'video' | 'screen';

export interface RTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup' | 'renegotiate';
  from: string;
  to: string;
  payload: unknown;
  timestamp: number;
}

export interface PeerConnection {
  id: string;
  peerId: string;
  connection: RTCPeerConnection;
  state: ConnectionState;
  dataChannels: Map<string, RTCDataChannel>;
  localStreams: Map<string, MediaStream>;
  remoteStreams: Map<string, MediaStream>;
  stats: ConnectionStats;
  createdAt: number;
}

export interface ConnectionStats {
  bytesSent: number;
  bytesReceived: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  videoStats?: VideoStats;
  audioStats?: AudioStats;
}

export interface VideoStats {
  frameWidth: number;
  frameHeight: number;
  framesPerSecond: number;
  framesDropped: number;
  codec: string;
}

export interface AudioStats {
  sampleRate: number;
  channelCount: number;
  codec: string;
  echoReturnLoss: number;
}

export interface MediaConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export interface DataChannelConfig {
  ordered?: boolean;
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
  protocol?: string;
  negotiated?: boolean;
  id?: number;
}

export interface StreamConfig {
  audio?: boolean;
  video?: boolean | {
    width?: number;
    height?: number;
    frameRate?: number;
    facingMode?: 'user' | 'environment';
  };
}

export interface ScreenShareConfig {
  video?: {
    cursor?: 'always' | 'motion' | 'never';
    displaySurface?: 'monitor' | 'window' | 'browser';
  };
  audio?: boolean;
  selfBrowserSurface?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
}

export interface BandwidthConfig {
  maxBitrate?: number;
  minBitrate?: number;
  targetBitrate?: number;
  video?: {
    maxBitrate?: number;
    maxFrameRate?: number;
  };
  audio?: {
    maxBitrate?: number;
  };
}

export interface RoomConfig {
  id: string;
  name: string;
  maxParticipants?: number;
  allowScreenShare?: boolean;
  allowDataChannels?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  streams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

// ============================================================================
// RTC SERVICE
// ============================================================================

class RTCService {
  private static instance: RTCService;

  private config: RTCConfig;
  private peers: Map<string, PeerConnection> = new Map();
  private localUserId: string = '';
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private signalingHandler: ((message: SignalingMessage) => void) | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private bandwidthConfig: BandwidthConfig = {};

  private constructor() {
    this.config = {
      iceServers: DEFAULT_ICE_SERVERS,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle'
    };
  }

  public static getInstance(): RTCService {
    if (!RTCService.instance) {
      RTCService.instance = new RTCService();
    }
    return RTCService.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initiera RTC-service
   */
  public initialize(
    userId: string,
    config?: Partial<RTCConfig>
  ): void {
    this.localUserId = userId;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Starta stats-polling
    this.startStatsPolling();
  }

  /**
   * Konfigurera signaling-hanterare
   */
  public setSignalingHandler(
    handler: (message: SignalingMessage) => void
  ): void {
    this.signalingHandler = handler;
  }

  /**
   * Hantera inkommande signaling-meddelande
   */
  public async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    switch (message.type) {
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      case 'hangup':
        this.handleHangup(message.from);
        break;
      case 'renegotiate':
        await this.renegotiate(message.from);
        break;
    }
  }

  // ============================================================================
  // MEDIA STREAMS
  // ============================================================================

  /**
   * Hämta lokala media-strömmar
   */
  public async getLocalStream(config: StreamConfig = {}): Promise<MediaStream> {
    const constraints: MediaConstraints = {
      audio: config.audio !== false,
      video: config.video !== false ? (
        typeof config.video === 'object' ? {
          width: { ideal: config.video.width || 1280 },
          height: { ideal: config.video.height || 720 },
          frameRate: { ideal: config.video.frameRate || 30 },
          facingMode: config.video.facingMode || 'user'
        } : true
      ) : false
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.emit('localStreamReady', { stream: this.localStream });
      return this.localStream;
    } catch (error) {
      console.error('Kunde inte hämta media:', error);
      throw error;
    }
  }

  /**
   * Starta skärmdelning
   */
  public async startScreenShare(config: ScreenShareConfig = {}): Promise<MediaStream> {
    try {
      const constraints = {
        video: {
          cursor: config.video?.cursor || 'always',
          displaySurface: config.video?.displaySurface || 'monitor'
        } as DisplayMediaStreamOptions['video'],
        audio: config.audio || false
      };

      this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // Lyssna på när delning avslutas
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

      // Ersätt video-track i alla peers
      for (const peer of this.peers.values()) {
        await this.replaceTrack(peer.peerId, 'video', this.screenStream.getVideoTracks()[0]);
      }

      this.emit('screenShareStarted', { stream: this.screenStream });
      return this.screenStream;
    } catch (error) {
      console.error('Kunde inte starta skärmdelning:', error);
      throw error;
    }
  }

  /**
   * Stoppa skärmdelning
   */
  public async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Återställ video-track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        for (const peer of this.peers.values()) {
          await this.replaceTrack(peer.peerId, 'video', videoTrack);
        }
      }

      this.emit('screenShareStopped', {});
    }
  }

  /**
   * Byt track
   */
  private async replaceTrack(
    peerId: string,
    kind: 'audio' | 'video',
    newTrack: MediaStreamTrack
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    const sender = peer.connection.getSenders().find(
      s => s.track?.kind === kind
    );

    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }

  /**
   * Muta/avmuta ljud
   */
  public setAudioEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.emit('audioStateChanged', { enabled });
    }
  }

  /**
   * Aktivera/avaktivera video
   */
  public setVideoEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.emit('videoStateChanged', { enabled });
    }
  }

  /**
   * Stoppa lokala strömmar
   */
  public stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.stopScreenShare();
  }

  // ============================================================================
  // PEER CONNECTIONS
  // ============================================================================

  /**
   * Skapa peer-connection
   */
  public async createPeerConnection(peerId: string): Promise<PeerConnection> {
    const connection = new RTCPeerConnection(this.config);

    const peer: PeerConnection = {
      id: `${this.localUserId}_${peerId}`,
      peerId,
      connection,
      state: 'new',
      dataChannels: new Map(),
      localStreams: new Map(),
      remoteStreams: new Map(),
      stats: this.createEmptyStats(),
      createdAt: Date.now()
    };

    // Lägg till lokala strömmar
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream!);
      });
      peer.localStreams.set('camera', this.localStream);
    }

    // Event handlers
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.localUserId,
          to: peerId,
          payload: event.candidate,
          timestamp: Date.now()
        });
      }
    };

    connection.oniceconnectionstatechange = () => {
      peer.state = this.mapIceState(connection.iceConnectionState);
      this.emit('connectionStateChanged', { peerId, state: peer.state });

      if (peer.state === 'failed') {
        this.handleConnectionFailure(peerId);
      }
    };

    connection.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        peer.remoteStreams.set(stream.id, stream);
        this.emit('remoteStreamAdded', { peerId, stream });
      }
    };

    connection.ondatachannel = (event) => {
      this.setupDataChannel(peerId, event.channel);
    };

    connection.onnegotiationneeded = async () => {
      if (connection.signalingState === 'stable') {
        await this.createAndSendOffer(peerId);
      }
    };

    this.peers.set(peerId, peer);
    this.emit('peerCreated', { peerId });

    return peer;
  }

  /**
   * Initiera samtal
   */
  public async call(peerId: string): Promise<void> {
    let peer = this.peers.get(peerId);

    if (!peer) {
      peer = await this.createPeerConnection(peerId);
    }

    await this.createAndSendOffer(peerId);
  }

  /**
   * Avsluta samtal
   */
  public hangup(peerId: string): void {
    this.sendSignalingMessage({
      type: 'hangup',
      from: this.localUserId,
      to: peerId,
      payload: null,
      timestamp: Date.now()
    });

    this.closePeerConnection(peerId);
  }

  /**
   * Avsluta alla samtal
   */
  public hangupAll(): void {
    for (const peerId of this.peers.keys()) {
      this.hangup(peerId);
    }
  }

  private closePeerConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Stäng data channels
    peer.dataChannels.forEach(channel => channel.close());

    // Stäng connection
    peer.connection.close();

    // Ta bort peer
    this.peers.delete(peerId);

    this.emit('peerDisconnected', { peerId });
  }

  // ============================================================================
  // SIGNALING
  // ============================================================================

  private async createAndSendOffer(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    try {
      const offer = await peer.connection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peer.connection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        from: this.localUserId,
        to: peerId,
        payload: offer,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Kunde inte skapa offer:', error);
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    const peerId = message.from;
    let peer = this.peers.get(peerId);

    if (!peer) {
      peer = await this.createPeerConnection(peerId);
    }

    try {
      await peer.connection.setRemoteDescription(
        new RTCSessionDescription(message.payload as RTCSessionDescriptionInit)
      );

      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      this.sendSignalingMessage({
        type: 'answer',
        from: this.localUserId,
        to: peerId,
        payload: answer,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Kunde inte hantera offer:', error);
    }
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    const peer = this.peers.get(message.from);
    if (!peer) return;

    try {
      await peer.connection.setRemoteDescription(
        new RTCSessionDescription(message.payload as RTCSessionDescriptionInit)
      );
    } catch (error) {
      console.error('Kunde inte hantera answer:', error);
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    const peer = this.peers.get(message.from);
    if (!peer) return;

    try {
      await peer.connection.addIceCandidate(
        new RTCIceCandidate(message.payload as RTCIceCandidateInit)
      );
    } catch (error) {
      console.error('Kunde inte lägga till ICE-kandidat:', error);
    }
  }

  private handleHangup(peerId: string): void {
    this.closePeerConnection(peerId);
  }

  private async renegotiate(peerId: string): Promise<void> {
    await this.createAndSendOffer(peerId);
  }

  private sendSignalingMessage(message: SignalingMessage): void {
    if (this.signalingHandler) {
      this.signalingHandler(message);
    } else {
      console.warn('Ingen signaling-hanterare konfigurerad');
    }
  }

  // ============================================================================
  // DATA CHANNELS
  // ============================================================================

  /**
   * Skapa data channel
   */
  public createDataChannel(
    peerId: string,
    label: string,
    config?: DataChannelConfig
  ): RTCDataChannel | null {
    const peer = this.peers.get(peerId);
    if (!peer) return null;

    const channel = peer.connection.createDataChannel(label, config);
    this.setupDataChannel(peerId, channel);

    return channel;
  }

  private setupDataChannel(peerId: string, channel: RTCDataChannel): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    channel.onopen = () => {
      this.emit('dataChannelOpen', { peerId, label: channel.label });
    };

    channel.onclose = () => {
      peer.dataChannels.delete(channel.label);
      this.emit('dataChannelClose', { peerId, label: channel.label });
    };

    channel.onerror = (error) => {
      this.emit('dataChannelError', { peerId, label: channel.label, error });
    };

    channel.onmessage = (event) => {
      this.emit('dataChannelMessage', {
        peerId,
        label: channel.label,
        data: event.data
      });
    };

    peer.dataChannels.set(channel.label, channel);
  }

  /**
   * Skicka data via channel
   */
  public sendData(peerId: string, channelLabel: string, data: string | Blob | ArrayBuffer): boolean {
    const peer = this.peers.get(peerId);
    const channel = peer?.dataChannels.get(channelLabel);

    if (channel && channel.readyState === 'open') {
      channel.send(data as string);
      return true;
    }

    return false;
  }

  /**
   * Broadcast data till alla peers
   */
  public broadcastData(channelLabel: string, data: string | Blob | ArrayBuffer): void {
    for (const peerId of this.peers.keys()) {
      this.sendData(peerId, channelLabel, data);
    }
  }

  // ============================================================================
  // BANDWIDTH & QUALITY
  // ============================================================================

  /**
   * Konfigurera bandbredd
   */
  public setBandwidthConfig(config: BandwidthConfig): void {
    this.bandwidthConfig = config;

    // Applicera på alla peers
    for (const peer of this.peers.values()) {
      this.applyBandwidthConstraints(peer);
    }
  }

  private async applyBandwidthConstraints(peer: PeerConnection): Promise<void> {
    const senders = peer.connection.getSenders();

    for (const sender of senders) {
      if (!sender.track) continue;

      const params = sender.getParameters();

      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }

      const encoding = params.encodings[0];
      const kind = sender.track.kind;

      if (kind === 'video' && this.bandwidthConfig.video) {
        encoding.maxBitrate = this.bandwidthConfig.video.maxBitrate;
        encoding.maxFramerate = this.bandwidthConfig.video.maxFrameRate;
      } else if (kind === 'audio' && this.bandwidthConfig.audio) {
        encoding.maxBitrate = this.bandwidthConfig.audio.maxBitrate;
      }

      await sender.setParameters(params);
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  private startStatsPolling(): void {
    if (this.statsInterval) return;

    this.statsInterval = setInterval(async () => {
      for (const [peerId, peer] of this.peers) {
        const stats = await this.getConnectionStats(peerId);
        if (stats) {
          peer.stats = stats;
          this.emit('statsUpdated', { peerId, stats });
        }
      }
    }, 1000);
  }

  /**
   * Hämta connection-statistik
   */
  public async getConnectionStats(peerId: string): Promise<ConnectionStats | null> {
    const peer = this.peers.get(peerId);
    if (!peer) return null;

    try {
      const stats = await peer.connection.getStats();
      return this.parseStats(stats);
    } catch {
      return null;
    }
  }

  private parseStats(stats: RTCStatsReport): ConnectionStats {
    let bytesSent = 0;
    let bytesReceived = 0;
    let packetsLost = 0;
    let jitter = 0;
    let roundTripTime = 0;
    let videoStats: VideoStats | undefined;
    let audioStats: AudioStats | undefined;

    stats.forEach(report => {
      if (report.type === 'outbound-rtp') {
        bytesSent += report.bytesSent || 0;

        if (report.kind === 'video') {
          videoStats = {
            frameWidth: report.frameWidth || 0,
            frameHeight: report.frameHeight || 0,
            framesPerSecond: report.framesPerSecond || 0,
            framesDropped: 0,
            codec: ''
          };
        }
      }

      if (report.type === 'inbound-rtp') {
        bytesReceived += report.bytesReceived || 0;
        packetsLost += report.packetsLost || 0;
        jitter = report.jitter || 0;
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        roundTripTime = report.currentRoundTripTime || 0;
      }
    });

    return {
      bytesSent,
      bytesReceived,
      packetsLost,
      jitter,
      roundTripTime,
      bandwidth: {
        upload: 0,
        download: 0
      },
      videoStats,
      audioStats
    };
  }

  private createEmptyStats(): ConnectionStats {
    return {
      bytesSent: 0,
      bytesReceived: 0,
      packetsLost: 0,
      jitter: 0,
      roundTripTime: 0,
      bandwidth: { upload: 0, download: 0 }
    };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private mapIceState(state: RTCIceConnectionState): ConnectionState {
    const mapping: Record<RTCIceConnectionState, ConnectionState> = {
      'new': 'new',
      'checking': 'connecting',
      'connected': 'connected',
      'completed': 'connected',
      'disconnected': 'disconnected',
      'failed': 'failed',
      'closed': 'closed'
    };
    return mapping[state] || 'new';
  }

  private async handleConnectionFailure(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Försök att återansluta genom ICE restart
    try {
      const offer = await peer.connection.createOffer({ iceRestart: true });
      await peer.connection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        from: this.localUserId,
        to: peerId,
        payload: offer,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('ICE restart misslyckades:', error);
      this.closePeerConnection(peerId);
    }
  }

  /**
   * Hämta lokal användar-ID
   */
  public getLocalUserId(): string {
    return this.localUserId;
  }

  /**
   * Lista alla peers
   */
  public getPeers(): string[] {
    return Array.from(this.peers.keys());
  }

  /**
   * Hämta peer-information
   */
  public getPeer(peerId: string): PeerConnection | undefined {
    return this.peers.get(peerId);
  }

  /**
   * Rensa och stäng ned
   */
  public cleanup(): void {
    this.hangupAll();
    this.stopLocalStream();

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
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

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook för RTC
 */
export function useRTC(userId: string, config?: Partial<RTCConfig>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const service = useRef(RTCService.getInstance());

  useEffect(() => {
    service.current.initialize(userId, config);
    setIsInitialized(true);

    return () => {
      service.current.cleanup();
    };
  }, [userId]);

  return { isInitialized, service: service.current };
}

/**
 * Hook för lokala media
 */
export function useLocalMedia(config?: StreamConfig) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const service = RTCService.getInstance();

  const start = useCallback(async () => {
    try {
      const localStream = await service.getLocalStream(config);
      setStream(localStream);
      setError(null);
      return localStream;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Kunde inte hämta media'));
      return null;
    }
  }, [config]);

  const stop = useCallback(() => {
    service.stopLocalStream();
    setStream(null);
  }, []);

  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    service.setAudioEnabled(newState);
    setIsAudioEnabled(newState);
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    const newState = !isVideoEnabled;
    service.setVideoEnabled(newState);
    setIsVideoEnabled(newState);
  }, [isVideoEnabled]);

  return {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    error,
    start,
    stop,
    toggleAudio,
    toggleVideo
  };
}

/**
 * Hook för peer connections
 */
export function usePeerConnection(peerId: string) {
  const [state, setState] = useState<ConnectionState>('new');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const service = RTCService.getInstance();

  useEffect(() => {
    const unsubState = service.on('connectionStateChanged', (data: unknown) => {
      const event = data as { peerId: string; state: ConnectionState };
      if (event.peerId === peerId) {
        setState(event.state);
      }
    });

    const unsubStream = service.on('remoteStreamAdded', (data: unknown) => {
      const event = data as { peerId: string; stream: MediaStream };
      if (event.peerId === peerId) {
        setRemoteStream(event.stream);
      }
    });

    const unsubStats = service.on('statsUpdated', (data: unknown) => {
      const event = data as { peerId: string; stats: ConnectionStats };
      if (event.peerId === peerId) {
        setStats(event.stats);
      }
    });

    return () => {
      unsubState();
      unsubStream();
      unsubStats();
    };
  }, [peerId]);

  const call = useCallback(() => {
    service.call(peerId);
  }, [peerId]);

  const hangup = useCallback(() => {
    service.hangup(peerId);
  }, [peerId]);

  return { state, remoteStream, stats, call, hangup };
}

/**
 * Hook för screen share
 */
export function useScreenShare() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const service = RTCService.getInstance();

  useEffect(() => {
    const unsubStart = service.on('screenShareStarted', (data: unknown) => {
      setStream((data as { stream: MediaStream }).stream);
      setIsSharing(true);
    });

    const unsubStop = service.on('screenShareStopped', () => {
      setStream(null);
      setIsSharing(false);
    });

    return () => {
      unsubStart();
      unsubStop();
    };
  }, []);

  const start = useCallback(async (config?: ScreenShareConfig) => {
    return service.startScreenShare(config);
  }, []);

  const stop = useCallback(() => {
    service.stopScreenShare();
  }, []);

  return { stream, isSharing, start, stop };
}

/**
 * Hook för data channels
 */
export function useDataChannel(peerId: string, label: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const service = RTCService.getInstance();

  useEffect(() => {
    const unsubOpen = service.on('dataChannelOpen', (data: unknown) => {
      const event = data as { peerId: string; label: string };
      if (event.peerId === peerId && event.label === label) {
        setIsOpen(true);
      }
    });

    const unsubClose = service.on('dataChannelClose', (data: unknown) => {
      const event = data as { peerId: string; label: string };
      if (event.peerId === peerId && event.label === label) {
        setIsOpen(false);
      }
    });

    const unsubMessage = service.on('dataChannelMessage', (data: unknown) => {
      const event = data as { peerId: string; label: string; data: unknown };
      if (event.peerId === peerId && event.label === label) {
        setLastMessage(event.data);
      }
    });

    return () => {
      unsubOpen();
      unsubClose();
      unsubMessage();
    };
  }, [peerId, label]);

  const send = useCallback((data: string | Blob | ArrayBuffer) => {
    return service.sendData(peerId, label, data);
  }, [peerId, label]);

  const create = useCallback((config?: DataChannelConfig) => {
    return service.createDataChannel(peerId, label, config);
  }, [peerId, label]);

  return { isOpen, lastMessage, send, create };
}

// ============================================================================
// EXPORT
// ============================================================================

export const rtcService = RTCService.getInstance();
export default rtcService;
