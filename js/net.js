/* WebRTC P2P Net Manager via PeerJS */
class SuperaNet {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.connections = []; // For host managing multiple peers if needed
    this.isHost = false;
    this.roomCode = '';
    this.onDataCallback = null;
    this.onConnectCallback = null;
  }

  // Generate a random 4-digit room code
  generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Host a room
  hostRoom(callback) {
    this.isHost = true;
    this.roomCode = 'sup-' + this.generateCode();

    this.peer = new Peer(this.roomCode);

    this.peer.on('open', (id) => {
      console.log('Room hosted with ID:', id);
      if (callback) callback(this.roomCode.replace('sup-', ''));
    });

    this.peer.on('connection', (connection) => {
      this.connections.push(connection);
      this.conn = connection; // For 2-player or primary
      this.setupConnectionEvents();
      if (this.onConnectCallback) this.onConnectCallback(connection);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      alert('Erro na conexão: ' + err.type);
    });
  }

  // Join a room
  joinRoom(code, callback, errorCallback) {
    this.isHost = false;
    this.roomCode = 'sup-' + code.trim();

    this.peer = new Peer();

    this.peer.on('open', (id) => {
      console.log('My peer ID is:', id);
      this.conn = this.peer.connect(this.roomCode);

      this.conn.on('open', () => {
        console.log('Connected to host!');
        this.setupConnectionEvents();
        if (callback) callback();
      });

      this.conn.on('error', (err) => {
        console.error('Connection error:', err);
        if (errorCallback) errorCallback(err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (errorCallback) errorCallback(err);
    });
  }

  setupConnectionEvents() {
    if (!this.conn) return;
    this.conn.on('data', (data) => {
      console.log('Received data:', data);
      if (this.onDataCallback) this.onDataCallback(data);
    });

    this.conn.on('close', () => {
      alert('Conexão encerrada pelo outro jogador.');
    });
  }

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    } else {
      console.warn('Connection not open, cannot send:', data);
    }
  }

  onData(cb) { this.onDataCallback = cb; }
  onConnect(cb) { this.onConnectCallback = cb; }
}

window.superaNet = new SuperaNet();
