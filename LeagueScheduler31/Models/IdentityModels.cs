using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using LeagueScheduler.Models;

namespace LeagueScheduler.Models
{
    // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class ApplicationUser : IdentityUser
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);

            // Add custom user claims here
            //var dbContext = new SchedulerDbContext();
            //var userId = userIdentity.GetUserId();
            //var userLeagues = dbContext.LeagueUsers.Where(x => x.UserId == userId).ToList();

            //var canDeleteLeague = userLeagues.Where(x => x.Permission == "league-owner").Select(x => x.LeagueId);
            //var canEditLeague = userLeagues.Where(x => x.Permission == "league-owner" || x.Permission == "league-co-admin").Select(x => x.LeagueId);
            //var canEditScores = userLeagues
            //    .Where(x => x.Permission == "league-owner" || x.Permission == "league-co-admin" || x.Permission == "league-score-editor")
            //    .Select(x => x.LeagueId);

            ////userIdentity.AddClaim(new Claim("foo-type", "bar-value"));
            //userIdentity.AddClaim(new Claim("can-delete-league", string.Join(",", canDeleteLeague)));
            //userIdentity.AddClaim(new Claim("can-edit-league", string.Join(",", canEditLeague)));
            //userIdentity.AddClaim(new Claim("can-edit-scores", string.Join(",", canEditScores)));

            return userIdentity;
        }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        //public ApplicationDbContext()
        //    : base("DefaultConnection")
        //{
        //}
        public ApplicationDbContext()
            : base("elite-schedule-auth-db")
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }
    }
}