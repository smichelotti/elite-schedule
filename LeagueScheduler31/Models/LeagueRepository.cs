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

        public object GetMyLeagues(string userId)
        {
            var leagues = from l in context.Leagues
                          join lu in context.LeagueUsers on l.Id equals lu.LeagueId
                          where lu.UserId == userId
                          select new { l.Id, l.Name, l.IsDirty, l.HomeScreen, l.RulesScreen, l.IsArchived, l.IsActive, lu.Permission };
            return leagues;
        }

        public object GetLeagueMembers(int id)
        {
            // Have to do 2 independent queries and then join in memory because currently 2 different DBs
            var leagueMembers = this.context.LeagueUsers.Where(x => x.LeagueId == id).ToList();
            var userIdList = leagueMembers.Select(x => x.UserId);
            var identityContext = new ApplicationDbContext();
            var leagueUsers = identityContext.Users.Where(x => userIdList.Contains(x.Id)).ToList();

            var members = from lm in leagueMembers
                          join lu in leagueUsers on lm.UserId equals lu.Id
                          select new { lm.UserId, lm.LeagueId, lm.Permission, lu.UserName, lu.Email };
            return members;
        }

        public LeagueUser GetLeagueMember(int leagueId, string memberId)
        {
            var member = this.context.LeagueUsers.SingleOrDefault(x => x.LeagueId == leagueId && x.UserId == memberId);
            return member;
        }

        public void RemoveLeagueMember(int leagueId, string memberId)
        {
            var leagueUser = this.context.LeagueUsers.SingleOrDefault(x => x.LeagueId == leagueId && x.UserId == memberId);
            if (leagueUser != null)
            {
                this.context.LeagueUsers.Remove(leagueUser);
                this.context.SaveChanges();
            }
        }

        public ApplicationUser FindUser(LeagueMemberResource member)
        {
            var identityContext = new ApplicationDbContext();
            var user = identityContext.Users.FirstOrDefault(x => x.UserName == member.Name || x.Email == member.Name);
            return user;
        }

        public League Find(int id)
        {
            return context.Leagues.Find(id);
        }

        public void InsertOrUpdate(LeagueUser leagueUser)
        {
            if (leagueUser.Id == default(int))
            {
                context.LeagueUsers.Add(leagueUser);
            }
            else
            {
                context.Entry(leagueUser).State = EntityState.Modified;
            }
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
            context.Database.ExecuteSqlCommand("DELETE FROM LeagueUsers WHERE LeagueId = " + id);
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
        object GetMyLeagues(string userId);
        object GetLeagueMembers(int id);
        LeagueUser GetLeagueMember(int leagueId, string memberId);
        void RemoveLeagueMember(int leagueId, string memberId);
        League Find(int id);
        ApplicationUser FindUser(LeagueMemberResource member);
        void InsertOrUpdate(LeagueUser leagueUser);
        void InsertOrUpdate(League league);
        void InsertOrUpdateClean(League league);
        void Delete(int id);
        void MarkDirty(int id);
        void MarkClean(int id);
        void Save();
    }
}