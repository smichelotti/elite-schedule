using System.Web;
using System.Web.Optimization;

namespace LeagueScheduler
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            //bundles.IgnoreList.Clear();
            //AddDefaultIgnorePatterns(bundles.IgnoreList);

            bundles.Add(
              new ScriptBundle("~/Scripts/vendor.js")
                  .Include("~/Scripts/jquery-{version}.js")
                  .Include("~/Scripts/lodash.min.js")
                  .Include("~/Scripts/modernizr-*")
                  .Include("~/Scripts/bootstrap.js")
                  .Include("~/Scripts/knockout-{version}.js")
                  .Include("~/Scripts/moment.js")
                  .Include("~/Scripts/showdown.js")
                  .Include("~/Scripts/bootstrap-datetimepicker.min.js")
              );

            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(
              new StyleBundle("~/Content/css")
                .Include("~/Content/ie10mobile.css")
                //.Include("~/Content/bootstrap.min.css")
                .Include("~/Content/bootstrap-cerulean-theme.min.css")
                .Include("~/Content/font-awesome.min.css")
                .Include("~/Content/durandal.css")
                .Include("~/Content/site.css")
                .Include("~/Content/custom.css")
                .Include("~/Content/datetimepicker.css")
              );

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));
        }


        public static void xRegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));
        }
    }
}
