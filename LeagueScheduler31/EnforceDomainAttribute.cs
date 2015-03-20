using LeagueScheduler.Controllers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LeagueScheduler
{
    public class EnforceDomainAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var isProd = (ConfigurationManager.AppSettings["environment"] == "prod");
            if (!isProd)
            {
                return;
            }

            var url = filterContext.HttpContext.Request.Url;
            var isAdmin = (filterContext.Controller is AdminController || filterContext.Controller is AccountController);
            //var isAdmin = url.Segments.Contains("/admin");
            var containsAzureSubdomain = url.Authority.Contains("azurewebsites.net");
            if (!isAdmin && containsAzureSubdomain)
            {
                // redirect to normal domain
                filterContext.HttpContext.Response.RedirectPermanent("http://elite-schedule.net" + url.PathAndQuery);
            }
            else if (isAdmin && !containsAzureSubdomain)
            {
                // redirect to subdomain
                filterContext.HttpContext.Response.RedirectPermanent("https://elite-schedule.azurewebsites.net" + url.PathAndQuery);
            }

            base.OnActionExecuting(filterContext);
        }
    }
}