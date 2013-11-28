using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

namespace LeagueScheduler.Models
{
    public class GameRepository : IGameRepository
    {
        private SchedulerDbContext context = new SchedulerDbContext();

        public IQueryable<Game> All
        {
            get { return context.Games; }
        }

        public IQueryable<Game> AllIncluding(params Expression<Func<Game, object>>[] includeProperties)
        {
            IQueryable<Game> query = context.Games;
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public Game Find(int id)
        {
            return context.Games.Find(id);
        }

        public void InsertOrUpdate(Game game)
        {
            if (game.Id == default(int))
            {
                // New entity
                context.Games.Add(game);
            }
            else
            {
                // Existing entity
                context.Entry(game).State = EntityState.Modified;
            }

            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(game.LeagueId);
        }

        public void Delete(int id)
        {
            var game = context.Games.Find(id);
            context.Games.Remove(game);
            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(game.LeagueId);
        }

        public void Save()
        {
            context.SaveChanges();
        }

        public void Dispose()
        {
            context.Dispose();
        }
    }

    public interface IGameRepository : IDisposable
    {
        IQueryable<Game> All { get; }
        IQueryable<Game> AllIncluding(params Expression<Func<Game, object>>[] includeProperties);
        Game Find(int id);
        void InsertOrUpdate(Game game);
        void Delete(int id);
        void Save();
    }
}