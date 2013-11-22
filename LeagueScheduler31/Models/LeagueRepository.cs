using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

namespace LeagueScheduler.Models
{
    public class LeagueRepository : ILeagueRepository
    {
        private SchedulerDbContext context = new SchedulerDbContext();

        public IQueryable<League> All
        {
            get { return context.Leagues; }
        }

        public IQueryable<League> AllIncluding(params Expression<Func<League, object>>[] includeProperties)
        {
            IQueryable<League> query = context.Leagues;
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public League Find(int id)
        {
            return context.Leagues.Find(id);
        }

        public void InsertOrUpdate(League league)
        {
            if (league.Id == default(int))
            {
                // New entity
                context.Leagues.Add(league);
            }
            else
            {
                // Existing entity
                context.Entry(league).State = EntityState.Modified;
            }
        }

        public void Delete(int id)
        {
            var drill = context.Leagues.Find(id);
            context.Leagues.Remove(drill);
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

    public interface ILeagueRepository : IDisposable
    {
        IQueryable<League> All { get; }
        IQueryable<League> AllIncluding(params Expression<Func<League, object>>[] includeProperties);
        League Find(int id);
        void InsertOrUpdate(League league);
        void Delete(int id);
        void Save();
    }
}