import {Router} from 'express';
import {HomeController} from '../controllers/homeController';
import {LoginController} from '../controllers/loginController';
import {MovieController} from '../controllers/movieController';
import {MessageController} from '../controllers/messageController';
import {UserController} from '../controllers/userController';
import {PersonController} from '../controllers/personController';


export class Routes {
    io: any;
    movieController: MovieController;
    messageController: MessageController;
    userController: UserController;
    loginController: LoginController;
    personController: PersonController;
    homeController: HomeController;

    constructor(io: any) {
        this.io = io;
        this.movieController = new MovieController();
        this.messageController = new MessageController(io);
        this.userController = new UserController();
        this.loginController = new LoginController();
        this.personController = new PersonController();
        this.homeController = new HomeController();
    }

    configureRoutes = (router: Router) => {
        router.post('/login', this.loginController.login);
        router.post('/chat-login', this.loginController.chatLogin);
        router.post('/message', this.messageController.createMessage);
        router.post('/movie', this.movieController.createMovie);
        router.post('/messages', this.messageController.searchMessages);
        router.post('/check-username', this.userController.checkUsername);
        router.post('/check-email', this.userController.checkEmailAddress);
        router.post('/create-user', this.userController.createUser);
        router.post('/person', this.personController.createPerson)
        router.post('/ping', this.homeController.ping)
        //this.router.post('/update-movies', movieCtrl.updateMovies);
        router.get('/messages', this.messageController.getMessages);
        router.get('/users', this.userController.getUsers);
        router.get('/categories', this.homeController.getCategories);
        router.get('/new-movie', this.userController.createUser);
        router.get('/movies/:userId', this.movieController.getMovies);
        router.get('/movie-details/:onlineId', this.movieController.getMovieDetails);
        router.get('/movie-search/:title/:page', this.movieController.searchMovies);
        router.get('/movie-formats', this.movieController.getFormats);
        //this.router.get('/conversations/:userId', this.messageController.getConversations);
        router.get('/user/:userId', this.userController.getUser);
        //this.router.get('/conversation/:conversationId', this.messageController.getConversation);
        //this.router.get('/conversation/messages/:conversationId', this.messageController.getConversationMessages);
        router.get('/movie/:userId/:imdbid', this.movieController.getMovie);
        router.put('/movie', this.movieController.updateMovie);
        router.delete('/person/:personId', this.personController.deletePerson)
        router.delete('/movie/:userId/:imdbid', this.movieController.deleteMovie);
        router.get('/update-movies', this.movieController.updateMovies);
        return router;
    }
}
