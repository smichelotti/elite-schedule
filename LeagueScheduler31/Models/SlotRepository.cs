using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

namespace LeagueScheduler.Models
{
    public class SlotRepository : ISlotRepository
    {
        private SchedulerDbContext context = new SchedulerDbContext();

        public IQueryable<Slot> All
        {
            get { return context.Slots; }
        }

        public IQueryable<Slot> AllIncluding(params Expression<Func<Slot, object>>[] includeProperties)
        {
            IQueryable<Slot> query = context.Slots;
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public Slot Find(int id)
        {
            return context.Slots.Find(id);
        }

        public void InsertOrUpdate(Slot Slot)
        {
            if (Slot.Id == default(int))
            {
                // New entity
                context.Slots.Add(Slot);
            }
            else
            {
                // Existing entity
                context.Entry(Slot).State = EntityState.Modified;
            }

            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(Slot.LeagueId);
        }

        public void Delete(int id)
        {
            var Slot = context.Slots.Find(id);
            context.Slots.Remove(Slot);
            var leagueRepository = new LeagueRepository();
            leagueRepository.MarkDirty(Slot.LeagueId);
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

    public interface ISlotRepository : IDisposable
    {
        IQueryable<Slot> All { get; }
        IQueryable<Slot> AllIncluding(params Expression<Func<Slot, object>>[] includeProperties);
        Slot Find(int id);
        void InsertOrUpdate(Slot Slot);
        void Delete(int id);
        void Save();
    }
}