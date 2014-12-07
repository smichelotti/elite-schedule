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
            league.IsDirty = true;

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

        public void InsertOrUpdateClean(League league)
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

        public void MarkDirty(int id)
        {
            context.Database.ExecuteSqlCommand("UPDATE Leagues SET IsDirty = 1 WHERE Id = @p0", id);
        }

        public void MarkClean(int id)
        {
            context.Database.ExecuteSqlCommand("UPDATE Leagues SET IsDirty = 0, IsActive = 1 WHERE Id = @p0", id);
        }

        public void Delete(int id)
        {
            var league = context.Leagues.Find(id);
            context.Leagues.Remove(league);
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
        void InsertOrUpdateClean(League league);
        void Delete(int id);
        void MarkDirty(int id);
        void MarkClean(int id);
        void Save();
    }
}