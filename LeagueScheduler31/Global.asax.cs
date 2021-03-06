﻿using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace LeagueScheduler
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static bool forceSSLForAdmin = Convert.ToBoolean(ConfigurationManager.AppSettings["forceSSL"]);

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            CloudStorageConfig.Configure();

            Database.SetInitializer<SchedulerDbContext>(null);

            //Database.SetInitializer<SchedulerDbContext>(new SchedulerDbInitializer());
            //UserDataInitializer.Seed();

        }

        protected void Application_BeginRequest(Object sender, EventArgs e)
        {
            var request = HttpContext.Current.Request;
            if (forceSSLForAdmin && !request.IsSecureConnection && !request.IsLocal && request.RawUrl == "/admin")
            {
                Response.Redirect("https://" + Request.ServerVariables["HTTP_HOST"] + request.RawUrl);
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();
            System.Diagnostics.Trace.TraceError(ex.ToString());
        }
    }
}
