using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

namespace LeagueScheduler.Models
{
    public class SpecialRequestRepository : ISpecialRequestRepository
    {
        private SchedulerDbContext context = new SchedulerDbContext();

        public IQueryable<SpecialRequest> All
        {
            get { return context.SpecialRequests; }
        }

        public IQueryable<SpecialRequest> AllIncluding(params Expression<Func<SpecialRequest, object>>[] includeProperties)
        {
            IQueryable<SpecialRequest> query = context.SpecialRequests;
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public SpecialRequest Find(int id)
        {
            return context.SpecialRequests.Find(id);
        }

        public void InsertOrUpdate(SpecialRequest SpecialRequest)
        {
            if (SpecialRequest.Id == default(int))
            {
                // New entity
                context.SpecialRequests.Add(SpecialRequest);
            }
            else
            {
                // Existing entity
                context.Entry(SpecialRequest).State = EntityState.Modified;
            }

            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(SpecialRequest.LeagueId);
        }

        public void Delete(int id)
        {
            var SpecialRequest = context.SpecialRequests.Find(id);
            context.SpecialRequests.Remove(SpecialRequest);
            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(SpecialRequest.LeagueId);
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

    public interface ISpecialRequestRepository : IDisposable
    {
        IQueryable<SpecialRequest> All { get; }
        IQueryable<SpecialRequest> AllIncluding(params Expression<Func<SpecialRequest, object>>[] includeProperties);
        SpecialRequest Find(int id);
        void InsertOrUpdate(SpecialRequest SpecialRequest);
        void Delete(int id);
        void Save();
    }
}