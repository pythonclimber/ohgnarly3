/**
 * Import dependencies
 */
import express from 'express'
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose'
import Debug from 'debug'
import {Server, Socket} from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import {getConnectionStrings, getAllowedOrigins, allowedOrigins, authorizationService} from './services'
import {Routes} from './routes';
import {MessageController} from "./controllers/messageController";

dotenv.config();

const logger = morgan;
const debug = Debug('ohgnarly:server');

/**
 * Initialize mongodb connection
 */
mongoose.Promise = global.Promise;
const connectionString = getConnectionStrings()['ohgnarly'];
mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

/**
 * Create express app and set middleware components
 */
let app = express();
let port = normalizePort(process.env.PORT || '1985');
app.set('port', port);


const appServer = app.listen(port, onListening);

/**
 * Create socket io object and create socket dependencies.
 */
const io = new Server(appServer, {
    cors: {
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST'],
        credentials: false
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
});

app.on('error', onError);
io.on('connection', onSocketConnect);

//const authUrlRegExp = new RegExp(`\/((?!${settings.authExclusionUrls.join('|')})np.)*`);

app.use(cors(allowedOrigins));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(authorizationService.validateApiCall);
const router = express.Router();
app.use('/', new Routes(io).configureRoutes(router));


function normalizePort(val: string) {
    console.log('port value: ' + val);
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = appServer.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

function onSocketConnect(socket: Socket) {
    const messageCtrl = new MessageController(io);
    socket.on('server-message', messageCtrl.addMessage);
    socket.on('disconnect', () => {
        console.log('disconnected');
    });
}