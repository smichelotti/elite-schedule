using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Http.Filters;
using Microsoft.AspNet.Identity;

namespace LeagueScheduler.Models
{
    public abstract class AuthorizatonLevelAttribute : AuthorizationFilterAttribute
    {
        private CustomClaimsManager claimsManager = new CustomClaimsManager();

        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var canExecuteAction = false;
            var uriSegments = actionContext.Request.RequestUri.Segments;
            var leaguesSegmentIndex = Array.IndexOf(uriSegments, "leagues");
            if (leaguesSegmentIndex != -1 && leaguesSegmentIndex+1 != uriSegments.Length)
            {
                // We have a "leagues" segment and it's not the last segment of the URI
                var leagueId = uriSegments[leaguesSegmentIndex + 1];
                var identity = (actionContext.RequestContext.Principal.Identity as ClaimsIdentity);
                var userId = identity.GetUserId();
                var claims = claimsManager.GetCustomClaims(userId);
                var claim = claims.SingleOrDefault(x => x.Type == this.Permission);
                if (claim != null)
                {
                    canExecuteAction = claim.Value.Split(',').Contains(leagueId);
                }
            }
            base.OnAuthorization(actionContext);
        }

        protected abstract string Permission { get; }
    }

    public class CanEditLeagueAttribute : AuthorizatonLevelAttribute
    {
        protected override string Permission
        {
            get { return "can-edit-league"; }
        }
    }

    public class CanEditLeagueScoresAttribute : AuthorizatonLevelAttribute
    {
        protected override string Permission
        {
            get { return "can-edit-scores"; }
        }
    }

    public class CanDeleteLeagueAttribute : AuthorizatonLevelAttribute
    {
        protected override string Permission
        {
            get { return "can-delete-league"; }
        }
    }
}