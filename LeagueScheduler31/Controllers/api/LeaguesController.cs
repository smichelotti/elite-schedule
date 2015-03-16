using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Results;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LeagueScheduler.Controllers
{
    [Authorize]
    public class LeaguesController : ApiController
    {
        private ILeagueRepository repository = new LeagueRepository();

        [AllowAnonymous]
        public List<League> Get()
        {
            try
            {
                return this.repository.All.Where(x => x.IsActive && !x.IsArchived).OrderBy(x => x.Name).ToList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceInformation(ex.ToString());
                throw;
            }
        }

        [Route("api/my-leagues")]
        public object GetMyLeagues()
        {
            var userId = this.User.Identity.GetUserId();
            var myLeagues = this.repository.GetMyLeagues(userId);
            return myLeagues;
        }

        [Route("api/leagues/{id}/members")]
        public object GetLeagueMembers(int id)
        {
            //TODO: check if request is Authorized for this *specific* league id
            return this.repository.GetLeagueMembers(id);
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/members")]
        public object AddLeagueMember(int id, LeagueMemberResource member)
        {
            //TODO: check if request is Authorized for this *specific* league id
            //var user = this.repository.FindUser(member);
            //if (user == null)
            //{
            //    var errorResponse = this.Request.CreateErrorResponse(HttpStatusCode.BadRequest,
            //        "Could not find any registered user in Elite Schedule with a username or email of: " + member.Name);
            //    throw new HttpResponseException(errorResponse);
            //}

            //var leagueMember = new LeagueUser { LeagueId = id, UserId = user.Id, Permission = member.Permission };
            ////TODO: add the "leagueMember" to DB
            //this.repository.InsertOrUpdate(leagueMember);
            //this.repository.Save();

            //return new { UserId = user.Id, LeagueId = id, Permission = member.Permission, UserName = user.UserName, Email = user.Email };
            return this.UpsertLeagueMember(id, null, member);
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/members/{memberId}")]
        public object DeleteLeagueMember(int id, string memberId)
        {
            this.repository.RemoveLeagueMember(id, memberId);
            return this.StatusCode(HttpStatusCode.NoContent);
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/members/{memberId}")]
        public object PutLeagueMember(int id, string memberId, LeagueMemberResource member)
        {
            //TODO: check if request is Authorized for this *specific* league id
            return this.UpsertLeagueMember(id, memberId, member);
        }

        public League Get(int id)
        {
            return this.repository.Find(id);
        }

        [CanEditLeague]
        public League Post(League item)
        {
            var userId = this.User.Identity.GetUserId();
            //TODO: need check to ensure league name is unique
            this.repository.InsertOrUpdate(item);
            this.repository.Save();

            var leagueOwner = new LeagueUser { LeagueId = item.Id, Permission = "league-owner", UserId = userId };
            this.repository.InsertOrUpdate(leagueOwner);
            this.repository.Save();

            //userManager.AddClaim()
            //var userIdentity = await userManager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            //this.User.Identity.AddClaim(new System.Security.Claims.Claim("foo-type", "bar-value"));
            //(this.User.Identity as ClaimsIdentity).AddClaim(new System.Security.Claims.Claim("foo-type", "bar-value"));
            //userManager.AddClaim(userId, new System.Security.Claims.Claim("foo-type", "bar-value"));
            //var appUser = new ApplicationUser();
            //await appUser.GenerateUserIdentityAsync(userManager);
            return item;
        }

        [CanEditLeague]
        public League Put(League item)
        {
            //TODO: need check to ensure league name is unique
            //this.repository.InsertOrUpdate(item);
            //this.repository.Save();
            //return item;

            // Only allow overwriting name
            var league = this.repository.Find(item.Id);
            league.Name = item.Name;
            this.repository.InsertOrUpdate(league);
            this.repository.Save();
            return league;
        }

        [CanDeleteLeague]
        public HttpResponseMessage Delete(int id)
        {
            this.repository.Delete(id);
            this.repository.Save();
            var response = this.Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/publish")]
        public IHttpActionResult PostPublish(int id)
        {
            var publisher = new LeaguePublisher();
            publisher.Publish(id);
            //var json = publisher.Publish(id);

            ////TODO: need to send back sensible code depending on publishing success
            ////return this.Ok();

            //var response = this.Request.CreateResponse(HttpStatusCode.OK);
            //response.Content = new StringContent(json, Encoding.UTF8, "application/json");

            //return response;

            return this.Ok(new { result = "success" });
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/archive")]
        public IHttpActionResult PostArchive(int id)
        {
            var league = this.repository.Find(id);
            league.IsArchived = true;
            this.repository.InsertOrUpdateClean(league);
            this.repository.Save();
            return this.Ok(new { result = "success" });
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/unarchive")]
        public IHttpActionResult PostUnarchive(int id)
        {
            var league = this.repository.Find(id);
            league.IsArchived = false;
            this.repository.InsertOrUpdateClean(league);
            this.repository.Save();
            return this.Ok(new { result = "success" });
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/reset-games")]
        public IHttpActionResult PostResetGames(int id)
        {
            var gameRepository = new GameRepository();
            gameRepository.DeleteGamesForLeague(id);
            gameRepository.Save();
            return this.Ok(new { result = "success" });
        }

        [Route("api/leagues/{id}/home-screen")]
        public IHttpActionResult GetHomeScreen(int id)
        {
            var league = this.repository.Find(id);
            var resource = new ContentResource { Text = league.HomeScreen };
            return this.Ok(resource);
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/home-screen")]
        public IHttpActionResult PutHomeScreen(int id, ContentResource resource)
        {
            var league = this.repository.Find(id);
            league.HomeScreen = resource.Text;
            this.repository.InsertOrUpdate(league);
            this.repository.Save();
            return this.Ok(resource);
        }

        [Route("api/leagues/{id}/rules-screen")]
        public IHttpActionResult GetRulesScreen(int id)
        {
            var league = this.repository.Find(id);
            var resource = new ContentResource { Text = league.RulesScreen };
            return this.Ok();
        }

        [CanEditLeague]
        [Route("api/leagues/{id}/rules-screen")]
        public IHttpActionResult PutRulesScreen(int id, ContentResource resource)
        {
            var league = this.repository.Find(id);
            league.RulesScreen = resource.Text;
            this.repository.InsertOrUpdate(league);
            this.repository.Save();
            return this.Ok(resource);
        }

        #region Private Members

        private object UpsertLeagueMember(int leagueId, string memberId, LeagueMemberResource member)
        {
            var user = this.repository.FindUser(member);
            if (user == null)
            {
                var errorResponse = this.Request.CreateErrorResponse(HttpStatusCode.BadRequest,
                    "Could not find any registered user in Elite Schedule with a username or email of: " + member.Name);
                throw new HttpResponseException(errorResponse);
            }

            LeagueUser leagueMember = null;
            if (memberId == null)
            {
                leagueMember = new LeagueUser { LeagueId = leagueId, UserId = user.Id, Permission = member.Permission };
            }
            else
            {
                leagueMember = this.repository.GetLeagueMember(leagueId, memberId);
                leagueMember.Permission = member.Permission;
            }

            this.repository.InsertOrUpdate(leagueMember);
            this.repository.Save();

            return new { UserId = user.Id, LeagueId = leagueId, Permission = member.Permission, UserName = user.UserName, Email = user.Email };
        }

        #endregion
    }
}
