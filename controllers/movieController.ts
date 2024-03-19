import {Request, Response} from 'express';
import {getFormats} from '../services/format';
import {MovieRepository} from '../repositories/movieRepository';


export class MovieController {
    private readonly movieRepository: MovieRepository;

    constructor(movieRepository?: MovieRepository) {
        this.movieRepository = movieRepository || new MovieRepository();
    }

    getMovies = async (req: Request, res: Response) => {
        try {
            const {userId} = req.params;
            const movies = await this.movieRepository.getMoviesForUser(userId);
            res.send(movies);
        } catch (err) {
            res.send(err);
        }
    };

    updateMovies = async(req: Request, res: Response) => {
        const userId = '5d9ce112b3608e16726bc0ea';
        const movies = await this.movieRepository.getMoviesForUser(userId);

        for (let movie of movies) {
            if (!movie.imdbid) {
                console.log(movie.title);
                const searchResults = await this.movieRepository.searchOnline(movie.title, 1);
                movie.imdbid = searchResults.results[0].imdbid
                await this.movieRepository.update(movie.userId, undefined, movie);
            }
        }

        res.send();
    }

    createMovie = async (req: Request, res: Response) => {
        try {
            const movie = await this.movieRepository.add(req.body);
            return res.send(movie);
        } catch (err) {
            return res.send(err);
        }
    };

    getMovieDetails = async (req: Request, res: Response) => {
        const onlineId = req.params.onlineId;
        if (!onlineId) {
            return res.send({success: false, error: 'An online ID is required'});
        }

        try {
            const movie = await this.movieRepository.getOnlineDetails(onlineId);
            res.send(movie);
        } catch (err) {
            res.send(err);
        }
    };

    searchMovies = async (req: Request, res: Response) => {
        const title = req.params.title;
        const page = parseInt(req.params.page) || 1;
        if (!title) {
            return res.send({success: false, error: 'Movie title is required!'});
        }

        try {
            const searchResults = await this.movieRepository.searchOnline(title, page);
            return res.send({success: true, results: searchResults.results, totalResults: searchResults.totalresults})
        } catch (err) {
            return res.send(err);
        }
    };

    deleteMovie = async (req: Request, res: Response) => {
        try {
            const result = await this.movieRepository.delete(req.params.userId, req.params.imdbid);
            return res.send({success: result});
        } catch (err) {
            return res.send({success: false, error: err});
        }
    };

    getFormats = async (req: Request, res: Response) => {
        const results = [];

        const formats = getFormats();
        for (let f in formats) {
            results.push(formats[f]);
        }

        res.send(results);
    };

    updateMovie = async (req: Request, res: Response) => {
        try {
            const updated = await this.movieRepository.update(req.body.userId, req.body.imdbid, req.body.update);
            return res.send({success: true, movie: updated});
        } catch (err) {
            res.send({success: false, error: err});
        }
    };

    getMovie = async (req: Request, res: Response) => {
        try {
            const movie = await this.movieRepository.get(req.params.userId, req.params.imdbid);
            const response = {movie: movie, found: !!movie};
            return res.send(response);
        } catch (err) {
            return res.send(err);
        }
    };
}