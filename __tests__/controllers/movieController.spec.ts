import {MovieRepository} from '../../repositories/movieRepository';
import {MovieController} from '../../controllers/movieController';
import {Movie, MovieDocument} from '../../models/movie';
import {Request, Response} from 'express';
import {SearchResults} from 'imdb-api';
import {expect} from "@jest/globals";

describe('MovieController', () => {
    let movieRepository: MovieRepository;
    let movieController: MovieController;
    let req: Request;
    let res: Response;

    beforeEach(() => {
        movieRepository = new MovieRepository();
        movieController = new MovieController(movieRepository);
        req = {} as Request;
        res = {send: jest.fn()} as any as Response;
    });

    describe('getMovies', () => {
        beforeEach(() => {
            req.params = {userId: '123'};
        });

        it('should return movies for user', async () => {
            const movies = [] as MovieDocument[];
            movieRepository.getMoviesForUser = jest.fn().mockResolvedValue(movies);

            await movieController.getMovies(req, res);

            expect(res.send).toHaveBeenCalledWith(movies);
        });

        it('should return error if lookup fails', async () => {
            let error = new Error();
            movieRepository.getMoviesForUser = jest.fn().mockRejectedValue(error);

            await movieController.getMovies(req, res);

            expect(res.send).toHaveBeenCalledWith(error);
        });
    });

    describe('createMovie', () => {
        it('should create a new movie', async () => {
            req.body = {title: 'Sleepers'} as Movie;
            const expected = {title: 'Sleepers'} as MovieDocument;
            movieRepository.add = jest.fn().mockResolvedValue(expected);

            await movieController.createMovie(req, res);

            expect(res.send).toHaveBeenCalledWith(expected);
        });

        it('should raise an error if insert fails', async () => {
            const expected = new Error('failure');
            movieRepository.add = jest.fn().mockRejectedValue(expected);

            await movieController.createMovie(req, res);

            expect(res.send).toHaveBeenCalledWith(expected);
        });
    });

    describe('getMovieDetails', () => {
        it('should return movie details', async () => {
            req.params = {onlineId: 'imdb-id'};
            const expected = {} as MovieDocument;
            movieRepository.getOnlineDetails = jest.fn().mockResolvedValue(expected);

            await movieController.getMovieDetails(req, res);

            expect(res.send).toHaveBeenCalledWith(expected);
        });

        it('should return an error if onlineId is falsy', async () => {
            req.params = {onlineId: undefined};

            await movieController.getMovieDetails(req, res);

            expect(res.send).toHaveBeenCalledWith({success: false, error: 'An online ID is required'})
        });

        it('should raise an error if lookup fails', async () => {
            req.params = {onlineId: 'imdb-id'};
            const expected = new Error('failure');
            movieRepository.getOnlineDetails = jest.fn().mockRejectedValue(expected);

            await movieController.getMovieDetails(req, res);

            expect(res.send).toHaveBeenCalledWith(expected);
        });
    });

    describe('searchMovies', () => {
        it('should return movie results', async () => {
            req.params = {title: 'title', page: '2'};
            const searchResults = {results: [{}], totalresults: 1} as any as SearchResults;
            const expected = {success: true, results: searchResults.results, totalResults: searchResults.totalresults}

            movieRepository.searchOnline = jest.fn().mockResolvedValue(searchResults);

            await movieController.searchMovies(req, res);

            expect(res.send).toHaveBeenCalledWith(expected);
        });

        it('should return error if lookup fails', async () => {
            req.params = {title: 'my-title'};
            const error = new Error();

            movieRepository.searchOnline = jest.fn().mockRejectedValue(error);

            await movieController.searchMovies(req, res);

            expect(res.send).toHaveBeenCalledWith(error);
        });

        it('should return error if title is missing', async () => {
            req.params = {title: undefined};

            await movieController.searchMovies(req, res);

            expect(res.send).toHaveBeenCalledWith({success: false, error: 'Movie title is required!'});
        });
    });

    describe('deleteMovie', () => {
        it('should delete a movie', async () => {
            req.params = {userId: '123', imdbid: '456'};

            movieRepository.delete = jest.fn().mockResolvedValue(true);

            await movieController.deleteMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({success: true});
        });

        it('returns error if delete fails', async () => {
            req.params = {userId: '123', imdbid: '456'};
            const error = new Error();
            movieRepository.delete = jest.fn().mockReturnValue(Promise.reject(error));

            await movieController.deleteMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({success: false, error: error});
        });
    });

    describe('getFormats', () => {
        it('should return a list of formats', async () => {
            const formats = ['DVD', 'Blu-ray', 'Blu-ray 3D', 'Blu-ray 4K', 'Digital SD',
                             'Digital HD', 'Digital UHD', 'VHS'];

            await movieController.getFormats(req, res);

            expect(res.send).toHaveBeenCalledWith(formats);
        });
    });
    
    describe('updateMovie', () => {
        it('should update movie record', async () => {
            req.body = {userId: '123', imdbid: '456', update: {} as Movie};
            let expected = {} as MovieDocument;
            movieRepository.update = jest.fn().mockResolvedValue(expected);

            await movieController.updateMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({success: true, movie: expected});
        });

        it('should raise exception if update fails', async () => {
            req.body = {userId: '123', imdbid: '456', update: {} as Movie};
            const error = new Error('update failed');
            movieRepository.update = jest.fn().mockRejectedValue(error);

            await movieController.updateMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({success: false, error: error});
        });
    });

    describe('getMovie', () => {
        it('should return a movie', async () => {
            req.params = {userId: '123', imdbid: '345'}
            const movie = {} as MovieDocument;

            movieRepository.get = jest.fn().mockResolvedValue(movie);

            await movieController.getMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({movie: movie, found: true});
        });

        it('should return found == false if movie not found', async () => {
            req.params = {userId: '123', imdbid: 'not-valid'}

            movieRepository.get = jest.fn().mockResolvedValue(null);

            await movieController.getMovie(req, res);

            expect(res.send).toHaveBeenCalledWith({movie: null, found: false});
        });

        it('should raise error if lookup fails', async () => {
            req.params = {userId: '', imdbid: ''};
            const error = new Error('lookup failed');

            movieRepository.get = jest.fn().mockRejectedValue(error);

            await movieController.getMovie(req, res);

            expect(res.send).toHaveBeenCalledWith(error);
        });
    });
});