/**
 * This is the API documentation for the Telerik Analytics plugin for AppBuilder.
 *
 * This documentation is for version 3.4.1.
 *
 * To start using this module you should enable the plugin in AppBuilder
 * (in project Properties &gt; Plugins &gt; Integrated Plugins &gt; Telerik Analytics).
 * If you are using plugin version 3.3.1 or older you should initialize the monitor by
 * including the initialization code example below somewhere in your application. When enabling
 * the module you have the possibility to select automatic exception tracking or automatic app feature tracking.
 * If you choose any of those options the module will start a new Analytics session in the
 * "deviceready" event without the need to include this code.
 *
 * See also:<br/>
   {{#crossLink "EqatecAnalytics.Factory/CreateMonitor"}}Factory.CreateMonitor{{/crossLink}}<br/>
   {{#crossLink "EqatecAnalytics.Factory/CreateMonitorWithSettings"}}Factory.CreateMonitorWithSettings{{/crossLink}}<br/>
   {{#crossLink "EqatecAnalytics.Factory/CreateSettings"}}Factory.CreateSettings{{/crossLink}}<br/>
   {{#crossLink "EqatecAnalytics.Monitor/Start"}}Monitor.Start{{/crossLink}}<br/>
  
      // Create the monitor instance using the unique product key
      // You should add this snippet to your application's startup code somewhere
      var productId = "YOUR-PRODUCT-KEY-HERE";
      var factory = window.plugins.EqatecAnalytics.Factory;
      var settings = factory.CreateSettings(productId);
      settings.LoggingInterface = factory.CreateTraceLogger(); // please log
      factory.CreateMonitorWithSettings(settings,
        function() {
          console.log("Monitor created");
          // Start the monitor
          window.plugins.EqatecAnalytics.Monitor.Start(function() {
            console.log("Monitor started");
          });
        },
        function(msg) {
          console.log("Error creating monitor: " + msg);
        });

      ....
      
      // Elsewhere in your code you can further use the Analytics API to track app's usage
      // EXAMPLE BEGIN
      var mon = window.plugins.EqatecAnalytics.Monitor;
      mon.TrackFeature("Imaging.ProcessDraggedFolder");
      mon.TrackFeatureValue("Imaging.FolderSize", folder.length);
      mon.TrackFeatureStart("Imaging.ProcessFolder");
      try
      {
        // do processing
        mon.TrackFeatureStop("Imaging.ProcessFolder");
      }
      catch (ex)
      {
        mon.TrackFeatureCancel("Imaging.ProcessFolder");
        mon.TrackExceptionMessage(ex, "Image processing failed for " + folder.name);
      }
      // EXAMPLE END
        
 * @module EqatecAnalytics
 */

var exec = require('cordova/exec');

/**
 @namespace EqatecAnalytics
 @class Factory
 @constructor
 */
var AnalyticsMonitorFactory = function() {};
/**
 @namespace EqatecAnalytics
 @class Monitor
 @constructor
 */
var AnalyticsMonitor = function() {};

var iceniumPluginVersion = "3.3.1";


/**
 * Create the EqatecAnalytics monitor.
 * 
 * @namespace EqatecAnalytics
 * @for Factory
 * @method CreateMonitor
 * @param {String} productId The numeric product id, e.g. "B568811797BD4419B50631716F0359AD"
 * @param {String} version An optional application version, e.g. "1.2.3"; if null or empty, the app version will be deduced automatically
 * @param {Function} successCallback The success callback, called when a monitor is created
 * @param {Function} failureCallback The error callback, called if a monitor could not be created
 * @example
      // Create the monitor instance using the unique product key
      var productId = "ae9827b48d5441a084a2XXXXXXXXXXXX";
      window.plugins.EqatecAnalytics.Factory.CreateMonitor(productId, null,
        function() {
          console.log("Monitor created");
          // Start the monitor
          window.plugins.EqatecAnalytics.Monitor.Start(function() {
            console.log("Monitor started");
          });
        },
        function(msg) {
          console.log("Error creating monitor: " + msg);
        });
 */
AnalyticsMonitorFactory.prototype.CreateMonitor = function(productId, version, successCallback, failureCallback)
{
	// Clear the logger callback javascript methods
	cordova.exec(null, null, "EqatecAnalytics", "LoggingSetLogErrorCallback", []);
	cordova.exec(null, null, "EqatecAnalytics", "LoggingSetLogMessageCallback", []);
	cordova.exec(successCallback, failureCallback, "EqatecAnalytics", "FactoryCreateMonitor", [productId, version]);
};


/**
 * Create the EqatecAnalytics monitor with more detailed settings.
 * 
 * @namespace EqatecAnalytics
 * @for Factory
 * @method CreateMonitorWithSettings
 * @param {Object} settings Detailed settings, created by {{#crossLink "EqatecAnalytics.Factory/CreateSettings"}}Factory.CreateSettings{{/crossLink}}:
       @param {String} settings.ProductId The numeric product id, e.g. "B568811797BD4419B50631716F0359AD"
       @param {String} settings.Version An optional application version, e.g. "1.2.3"; if null or empty, the app version will be deduced automatically 
       @param {Object} settings.LocationCoordinates Use this for geolocation. It has these two members:
           @param {Number} settings.LocationCoordinates.Latitude The latitude
           @param {Number} settings.LocationCoordinates.Longitude The longitude
       @param {Object} settings.ProxyConfig Specific proxy-configuration. It has these four members:
           @param {String} settings.ProxyConfig.Host the proxy hostname
           @param {Number} settings.ProxyConfig.Port the proxy port
           @param {String} settings.ProxyConfig.UserName the authorizing username
           @param {String} settings.ProxyConfig.Password the authorizing password
       @param {Object} settings.LoggingInterface An object that will be called back with log messages. The object must implement these two functions:
           A default logger printing to console.log can be created using {{#crossLink "CreateTraceLogger"}}{{/crossLink}}.
           @param {Function} settings.LoggingInterface.LogError Log a string error message from the monitor
           @param {Function} settings.LoggingInterface.LogMessage Log a string message from the monitor
       @param {Number} settings.DailyNetworkUtilizationInKB Daily data transfer limit; default is 2147483647 KB
       @param {Number} settings.MaxStorageSizeInKB Disk storage limit; default is 2147483647 KB
       @param {String} settings.ServerUri Advanced; point session data to a specific server
       @param {Number} settings.StorageSaveInterval Save statistics this often, in seconds; default is 60 sec
       @param settings.SynchronizeAutomatically Set to false for offline scenarios in concert with ForceSync
       @param {Boolean} settings.TestMode Mark data from this monitor session as originating from internal usage
       @param {Boolean} settings.UseSsl Use HTTPS instead of HTTP
 * @param {Function} successCallback	The success callback, called when a monitor is created
 * @param {Function} failureCallback	The error callback, called if a monitor could not be created
 * @example
      var factory = window.plugins.EqatecAnalytics.Factory;
      // Create the monitor instance using detailed settings
      var productId = "ae9827b48d5441a084a2XXXXXXXXXXXX";
      var settings = factory.CreateSettings(productId);
      settings.LoggingInterface = factory.CreateTraceLogger(); // please log
      factory.CreateMonitorWithSettings(settings,
        function() {
          console.log("Monitor created");
          // Start the monitor
          window.plugins.EqatecAnalytics.Monitor.Start(function() {
            console.log("Monitor started");
          });
        },
        function(msg) {
          console.log("Error creating monitor: " + msg);
        });
 */
AnalyticsMonitorFactory.prototype.CreateMonitorWithSettings = function(settings, successCallback, failureCallback)
{
	// Register the logger callback javascript methods
	cordova.exec(settings.LoggingInterface ? settings.LoggingInterface.LogError : null, null, "EqatecAnalytics", "LoggingSetLogErrorCallback", []);
	cordova.exec(settings.LoggingInterface ? settings.LoggingInterface.LogMessage : null, null, "EqatecAnalytics", "LoggingSetLogMessageCallback", []);
  if (settings.LoggingInterface)
  {
    if (typeof settings.LoggingInterface.LogMessage !== "function")
    {
      failureCallback("The specified LogMessage property must be a function, not " + typeof settings.LoggingInterface.LogMessage);
      return;
    }
    if (typeof settings.LoggingInterface.LogError !== "function")
    {
      failureCallback("The specified LogError property must be a function, not " + typeof settings.LoggingInterface.LogError);
      return;
    }
    settings.LoggingInterface.LogMessage("Telerik Analytics Monitor: Logging enabled (plugin version " + iceniumPluginVersion + ")");
  }
  
  // Sanitize the settings-object because invalid data may cause cordova to crash hard (eg SIGSEGV on iOS)
  if (settings) {
    // Make sure at least one property is set, as empty objects make cordova crash
    if (!settings.LoggingInterface) // set a harmless null value to the logging interface
      settings.LoggingInterface = null;
    // If proxy is set, but to an "empty" proxy-object, then delete it
    var proxy = settings.ProxyConfig;
    if (proxy && !proxy.Host && !proxy.Port && !proxy.UserName && !proxy.Password)
      delete settings.ProxyConfig;
  }
  
	cordova.exec(successCallback, failureCallback, "EqatecAnalytics", "FactoryCreateMonitorWithSettings", [settings]);
};


/**
 * Detect whether the monitor has already been created by one of the Create-methods
 * and therefore is alive and cannot be created again.
 * 
 * @namespace EqatecAnalytics
 * @for Factory
 * @method IsMonitorCreated
 * @param {Function} successCallback	Called with JSON string result IsCreated indicating "true"/"false"
 * whether the monitor has already been created
 * @example
          window.plugins.EqatecAnalytics.Factory.IsMonitorCreated(function(result) {
            if (result.IsCreated == "true") {
              // Monitor has already been created
            } else {
              // Monitor has not been created yet
            }
          });
 */
AnalyticsMonitorFactory.prototype.IsMonitorCreated = function(successCallback)
{
	cordova.exec(successCallback, null, "EqatecAnalytics", "FactoryIsMonitorCreated", []);
};


/**
 * Create settings suitable for passing to {{#crossLink "EqatecAnalytics.Factory/CreateMonitorWithSettings"}}Factory.CreateMonitorWithSettings{{/crossLink}}.
 * 
 * @namespace EqatecAnalytics
 * @for Factory
 * @method CreateSettings
 * @param {String} productId The numeric product id, e.g. "B568811797BD4419B50631716F0359AD"
 * @param {String} version An optional application version, e.g. "1.2.3"
 * @return A settings object in JSON
 * @example
      var factory = window.plugins.EqatecAnalytics.Factory;
      // Create the monitor instance using detailed settings
      var productId = "ae9827b48d5441a084a2XXXXXXXXXXXX";
      var settings = factory.CreateSettings(productId);
      settings.LoggingInterface = factory.CreateTraceLogger(); // please log
      factory.CreateMonitorWithSettings(settings,
        function() {
          console.log("Monitor created");
          // Start the monitor
          window.plugins.EqatecAnalytics.Monitor.Start(function() {
            console.log("Monitor started");
          });
        },
        function(msg) {
          console.log("Error creating monitor: " + msg);
        });
 */
AnalyticsMonitorFactory.prototype.CreateSettings = function(productId, version)
{
  if (typeof this.pluginVariables !== 'undefined' && this.pluginVariables != null) {
      if (typeof productId === 'undefined' || productId == null) {
        productId = this.pluginVariables.productId;
      }

      if (typeof version == 'undefined' || version == null) {
        version = this.pluginVariables.productVersion;
      }
  }

  var INTEGER_MAX_VALUE = 0x7FFFFFFF;  // max 32-bit signed integer value
  var settings = {
    "ProductId": productId,
    "Version": version || "",
    "LocationCoordinates": { "Latitude":0.0, "Longitude":0.0 },
    "ProxyConfig": { "Host":"", "Port":0, "UserName":"", "Password":"" },
    "LoggingInterface":null,
    "DailyNetworkUtilizationInKB": INTEGER_MAX_VALUE, 
    "MaxStorageSizeInKB": INTEGER_MAX_VALUE,
    "ServerUri": "http://" + productId.replace("-", "") + ".monitor-eqatec.com/",
    "StorageSaveInterval": 60,
    "SynchronizeAutomatically": true,
    "TestMode": false,
    "UseSsl": false,
  };
  return settings;
};

/**
 * Create the logger for outputting diagnostics from the monitor. You can build your
 * own logger and pass it along in the settings when creating a monitor using
 * {{#crossLink "EqatecAnalytics.Factory/CreateMonitorWithSettings"}}Factory.CreateMonitorWithSettings{{/crossLink}} or you can use
 * this one, which will output to the standard console.log.
 * 
 * @namespace EqatecAnalytics
 * @for Factory
 * @method CreateTraceLogger
 * @return A logger suitable for passing to the monitor in a settings object
 * @example
      var factory = window.plugins.EqatecAnalytics.Factory;
      // Create the monitor instance using detailed settings
      var productId = "ae9827b48d5441a084a2XXXXXXXXXXXX";
      var settings = factory.CreateSettings(productId);
      settings.LoggingInterface = factory.CreateTraceLogger(); // please log
      factory.CreateMonitorWithSettings(settings,
        function() { console.log("Monitor created"); },
        function(msg) { console.log("Error creating monitor: " + msg); }); 
 */
AnalyticsMonitorFactory.prototype.CreateTraceLogger = function()
{
	var logger = {
		LogError: function(errorMessage) {
			console.log("Telerik Analytics Monitor ***** ERROR *****: " + errorMessage);
		},
		LogMessage: function(message) {
			console.log("Telerik Analytics Monitor: " + message);
		}
	};
	return logger;
};


/**
 * Start the monitor. Note that none of the tracking calls have any
 * effect before this call. Repeated calls have no effect as only one
 * monitoring session can be started
 * The monitor must have been created prior to this call using a Factory.Create method.
 *
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method Start
 * @param {Function} successCallback The success callback, called when the monitor has been started
 * @example
      var factory = window.plugins.EqatecAnalytics.Factory;
      // Create the monitor instance using the unique product key
      var productId = "ae9827b48d5441a084a2XXXXXXXXXXXX";
      window.plugins.EqatecAnalytics.Factory.CreateMonitor(productId, null,
        function() {
          console.log("Monitor created");
          // Start the monitor
          window.plugins.EqatecAnalytics.Monitor.Start(function() {
            console.log("Monitor started");
          });
        },
        function(msg) {
          console.log("Error creating monitor: " + msg);
        });
 */
AnalyticsMonitor.prototype.Start = function(successCallback)
{
	cordova.exec(successCallback, null, "EqatecAnalytics", "MonitorStart", []);
};


/**
 * Stop the monitor. By stopping the monitor an attempt to deliver the last
 * data to the servers are made. If data could not be delivered it will be
 * attempted to deliver the data again on the next start of the monitor with
 * the same product id.
 * The monitor must have been created prior to this call using a Factory.Create method.
 *
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method Stop
 * @param {Function} successCallback	The success callback, called when the monitor has been stopped
 * @example
      // Stop the monitor
      window.plugins.EqatecAnalytics.Monitor.Stop(function() {
        console.log("Monitor stopped");
      });
 */
AnalyticsMonitor.prototype.Stop = function(successCallback)
{
	cordova.exec(successCallback, null, "EqatecAnalytics", "MonitorStop", []);
};


/**
 * Stop the monitor with a specified timeout. By stopping the monitor an attempt to deliver the last
 * data to the servers are made. If data could not be delivered it will be
 * attempted to deliver the data again on the next start of the monitor with
 * the same product id.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method StopWithTimeout
 * @param {Number} waitForCompletionInSeconds The timeout period in seconds
 * @param {Function} successCallback	The success callback, called when the monitor has been stopped
 * @example
      // Stop the monitor
      window.plugins.EqatecAnalytics.Monitor.StopWithTimeout(5, function() {
        console.log("Monitor stopped");
      });
 */
AnalyticsMonitor.prototype.StopWithTimeout = function(waitForCompletionInSeconds, successCallback)
{
	cordova.exec(successCallback, null, "EqatecAnalytics", "MonitorStopWithTimeout", [waitForCompletionInSeconds]);
};


/**
 * Track an exception with a context message. Delivers the exception
 * information to the server as soon as possible.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackExceptionMessage
 * @param exception the exception-object, for instance an Error
 * @param {String} message the free-form message providing further details about this particular error scenario
 * @example
        try
        {
           // code that throws an Error
        }
        catch (ex)
        {
          window.plugins.EqatecAnalytics.Monitor.TrackExceptionMessage(ex, "Context info");
        }
 */
AnalyticsMonitor.prototype.TrackExceptionMessage = function(exception, message)
{
  // Don't do anything if exception is null; user don't even expect a callback
  if (!exception)
    return;
  // Get information out from the exception. For eg an Error-object these properties will be defined.
  var typename = exception.name || typeof(exception) || "unknown";
  var reason = exception.message || "";
  var stack = exception.stack || "unknown";
  // Streamline stacktrace-format for the different platforms (just iPhone for now)
  if (navigator && navigator.platform == "iPhone")
  {
    stack = stack
             .replace(/(?:\n@:0)?\s+$/m, "") // erase some newline-@ stuff
             .replace(/^\(/gm, "{anonymous}(") // leading "(" -> "{anonymous}("
             .replace(/@file\:\/\/\/var\/mobile\/Applications\/[^\/]+\//gm, " at ") // X@file:///var/mobile/Applications/{GUID}/... -> "X at ..."
             .replace(/file\:\/\/\/var\/mobile\/Applications\/[^\/]+\//gm, "function at ") // file:///var/mobile/Applications/{GUID}/... -> "function at ..."
  }
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackExceptionMessage", [typename, reason, stack, message]);
};


/**
 * Track a named feature. Note the recommended use of a one-level
 * dot-notation for feature naming to allow for better grouping of related
 * features. Tracked features are not delivered to the server immediately
 * but are piggy-backed on the next delivery.
 * 
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackFeature
 * @param {String} featureName the feature name
 * @example
        window.plugins.EqatecAnalytics.Monitor.TrackFeature("MenuFile.SaveAll");
 */
AnalyticsMonitor.prototype.TrackFeature = function(featureName)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackFeature",	[featureName]);
};

		
/**
 * Start time tracking of a named feature. Note that the timing is not
 * recorded before a matching TrackFeatureStop has been called and that
 * there is no support for multiple concurrent timings of the same named
 * feature so multiple start calls without a matching stop for the same
 * feature will have no effect.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackFeatureStart
 * @param {String} featureName the feature name
 * @example
        window.plugins.EqatecAnalytics.Monitor.TrackFeatureStart("Imaging.ProcessFolder");
        try
        {
          // do processing
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureStop("Imaging.ProcessFolder");
        }
        catch (ex)
        {
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureCancel("Imaging.ProcessFolder");
          window.plugins.EqatecAnalytics.Monitor.TrackExceptionMessage(ex,
                                 "Image processing failed for " + folder.name);
        }
 */
AnalyticsMonitor.prototype.TrackFeatureStart = function(featureName)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackFeatureStart", [featureName]);
};

		
/**
 * Stop time tracking of a named feature. Note that this has no effect if
 * there has not been a matching TrackFeatureStart.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackFeatureStop
 * @param {String} featureName the feature name
 * @example
        window.plugins.EqatecAnalytics.Monitor.TrackFeatureStart("Imaging.ProcessFolder");
        try
        {
          // do processing
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureStop("Imaging.ProcessFolder");
        }
        catch (ex)
        {
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureCancel("Imaging.ProcessFolder");
          window.plugins.EqatecAnalytics.Monitor.TrackExceptionMessage(ex,
                                 "Image processing failed for " + folder.name);
        }
 */
AnalyticsMonitor.prototype.TrackFeatureStop = function(featureName)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackFeatureStop", [featureName]);
};


/**
 * Stop an ongoing time tracking of a named feature within registering the
 * time. This call can be used in the feature being time did not complete as
 * expected such as an exception occurring or the user canceling the
 * activity.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackFeatureCancel
 * @param {String} featureName the feature name
 * @example
        window.plugins.EqatecAnalytics.Monitor.TrackFeatureStart("Imaging.ProcessFolder");
        try
        {
          // do processing
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureStop("Imaging.ProcessFolder");
        }
        catch (ex)
        {
          window.plugins.EqatecAnalytics.Monitor.TrackFeatureCancel("Imaging.ProcessFolder");
          window.plugins.EqatecAnalytics.Monitor.TrackExceptionMessage(ex,
                                 "Image processing failed for " + folder.name);
        }
 */
AnalyticsMonitor.prototype.TrackFeatureCancel = function(featureName)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackFeatureCancel", [featureName]);
};

			  
/**
 * Track a value associated with a feature name. This tracking will
 * associate the given value with the feature and allow you to inspect e.g.
 * the distribution of value server side
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method TrackFeatureValue
 * @param {String} featureName the feature name
 * @param {Number} featureValue the value for the feature
 * @example
        window.plugins.EqatecAnalytics.Monitor.TrackFeatureValue("Imaging.FolderSize", folder.length);
 */
AnalyticsMonitor.prototype.TrackFeatureValue = function(featureName, trackedValue)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorTrackFeatureValue", [featureName, trackedValue]);
};

		
/**
 * Explicitly force a synchronization of the current information with the
 * analytics server. This call is not expected to be used in a standard
 * setup but may be helpful in occasionally connected scenarios. If you
 * created the monitor instance by explicitly setting
 * SynchronizeAutomatically to false this method is how you can force the
 * monitor to synchronize.
 * The monitor must have been created prior to this call using a Factory.Create method.
 *
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method ForceSync
 * @example
        window.plugins.EqatecAnalytics.Monitor.ForceSync();
 */
AnalyticsMonitor.prototype.ForceSync = function()
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorForceSync", []);
};

		
/**
 * Associate an installation ID with the current monitor and current session.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method SetInstallationInfo
 * @param installationID any given string that would suitably identify the installation
 * @example
        window.plugins.EqatecAnalytics.Monitor.SetInstallationInfo(user.id);
*/
AnalyticsMonitor.prototype.SetInstallationInfo = function(installationId)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorSetInstallationInfo", [installationId]);
};

		
/**
 * Associate an installation ID with the current monitor and allows for further
 * installation properties to be associated with the current session.
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method SetInstallationInfoAndProperties
 * @param installationID any given string that would suitably identify the installation
 * @param installationProperties a JSON object with key-value pairs to register for this installation and this session
 * @example
        window.plugins.EqatecAnalytics.Monitor.SetInstallationInfo(user.id, 
          { name:user.name,
            company:account.company,
            license:account.license,
          });
 */
AnalyticsMonitor.prototype.SetInstallationInfoAndProperties = function(installationId, installationProperties)
{
	cordova.exec(null, null, "EqatecAnalytics", "MonitorSetInstallationInfoAndProperties", [installationId, installationProperties]);
};

 
/**
 * The monitor must have been created prior to this call using a Factory.Create method.
 * 
 * @namespace EqatecAnalytics
 * @for Monitor
 * @method GetStatus
 * @param {Function} successCallback	The success callback where the status will be returned as a JSON object. Note
 * that all properties in the object will be strings, even numeric or boolean values
 * @example
        window.plugins.EqatecAnalytics.Monitor.GetStatus(function(status) {
          console.log("Monitor status:");
          for (var key in status)
            console.log("  " + key + "=" + status[key]);
        });
 */
AnalyticsMonitor.prototype.GetStatus = function(successCallback)
{
	cordova.exec(successCallback, null, "EqatecAnalytics", "MonitorGetStatus", []);
};



var EqatecAnalytics = {
	serviceName: "EqatecAnalytics",
	Factory: new AnalyticsMonitorFactory(),
	Monitor: new AnalyticsMonitor(),
};
module.exports = EqatecAnalytics;



















(function(window, undefined) {
    var monitor = window._eqatecmonitor = {
        autoTrackExceptions: false,
        autoTrackKendoEvents: false,
        isStarted: false,
        trackingEnabled: function() {
            return this.autoTrackExceptions || this.autoTrackKendoEvents;
        },
        start: function (productId, productVersion) {
            if (this.trackingEnabled() && !this.isStarted) {
                var factory = window.plugins.EqatecAnalytics.Factory;
                var settings = factory.CreateSettings(productId);
                if (typeof productVersion !== 'undefined' && productVersion !== null) {
                    settings.Version = productVersion;
                }

                var that = this;
                factory.CreateMonitorWithSettings(settings, function() {
                    window.plugins.EqatecAnalytics.Monitor.Start();
                    that.isStarted = true;

                    if (that.autoTrackExceptions) {
                        window.onerror = function (message, url, row, col, err) {
                            if (!err) {
                                var colonIndex = message.indexOf(":");

                                err = {
                                    name: message.substr(0, colonIndex),
                                    message: message.substr(colonIndex + 2),
                                    stack: "\n\tat (" + url + (row ? ":" + row : "") + (col ? ":" + col : "") + ")\n"
                                };
                            }

                            that.trackException(err, err.message);
                        };
                    }
                }, function(msg) {
                    console.log("Error creating monitor: " + msg);
                });
            }
        },
        stop: function() {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.Stop();
            }
        },
        trackFeature: function(featureName) {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.TrackFeature(featureName);
                this.forceSync();
            }
        },
        trackFeatureStart: function(featureName) {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.TrackFeatureStart(featureName);
            }
        },
        trackFeatureStop: function(featureName) {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.TrackFeatureStop(featureName);
                this.forceSync();
            }
        },
        trackException: function(ex, message) {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.TrackExceptionMessage(ex, message);
            }
        },
        forceSync: function() {
            if (this.isStarted) {
                window.plugins.EqatecAnalytics.Monitor.ForceSync();
            }
        }
    };

    window.onbeforeunload = function() {
        if (monitor.isStarted) {
            monitor.stop();
        }
    };

    window.addEventListener('deviceready', function () {
      cordova.getAppVersion(function (version) {
          cordova.exec(function(data) {
              var productId = data.productId;
              if(productId !== "YourKeyHere"){
                  var productVersion = version != null && version != 'N/A' ? version : null;
                  monitor.autoTrackKendoEvents = (data.autoTrackKendoEvents || '').toLowerCase() === 'true';
                  monitor.autoTrackExceptions = (data.autoTrackExceptions || '').toLowerCase() === 'true';
                  window.plugins.EqatecAnalytics.Factory.pluginVariables = {
                      productId: productId,
                      productVersion: productVersion
                  };
                  monitor.start(productId, productVersion);
              }
          }, function(err) {
              console.log('Unable to read required plugin variables: ' + err);
          }, 'EqatecAnalytics', 'GetVariables', [ 'productId', 'autoTrackKendoEvents', 'autoTrackExceptions' ]);
      });
    }, true);
})(window);


(function(window, undefined) {
    var analytics,
        monitor = window._eqatecmonitor,
        relatives = {
            external: "ExternalNavigation",
            modalview: "ModalView",
            popover: "PopOver",
            drawer: "Drawer",
            actionsheet: "ActionSheet"
        },
        performance = (window.performance && window.performance.now ? window.performance : {
            offset: Date.now(),
            now: function now() {
                return Date.now() - this.offset;
            }
        }),

        Analytics = function () {
            var $ = window.jQuery,
                that = this,
                viewLoadTimeStamp,
                viewShowTimeStamp,
                viewRenderTimeStamp,
                viewInteractionTimeStamp,
                proxy = function (callback) {
                    return $.proxy(callback, that);
                },
                getViewName = function(view) {
                    if (typeof view === 'string') {
                        var lastSlashIndex = view.lastIndexOf('/');
                        if (lastSlashIndex < 0) {
                            lastSlashIndex = 0;
                        } else {
                            lastSlashIndex++;
                        }

                        var lastDotIndex = view.lastIndexOf('.');
                        if (lastDotIndex < 0) {
                            lastDotIndex = view.length;
                        }

                        var result = view.slice(lastSlashIndex, lastDotIndex).replace(/[^a-z,0-9,\/,\.]/gi, '');
                        return result;
                    }
                    var name = view.id || view.element.attr("id") || '';
                    return getViewName(name);
                };

            Analytics.prototype.bindViewEvents = function(e) {
                e.view.trackingEnabled = (e.view.element.attr("data-track") === "true");

                if (!e.view.BoundAnalytics) {
                    e.view.bind(this.viewEvents);
                    e.view.BoundAnalytics = true;
                }
            };

            $.extend(Analytics.prototype, {
                init: proxy(function (e) {
                    viewLoadTimeStamp = performance.now();

                    that.viewEngine = e.sender.pane.viewEngine;
                    that.viewEngine.bind(this.viewEngineEvents);
                    that.viewEngine.viewContainer.bind(this.viewContainerEvents);
                }),

                viewEngineEvents: {
                    loadStart: proxy(function(e) {
                        viewLoadTimeStamp = performance.now();
                        monitor.trackFeatureStart('ViewsLoadTime.' + getViewName(e.sender.url));
                    }),

                    loadComplete: proxy(function(e) {
                        monitor.trackFeatureStop('ViewsLoadTime.' + getViewName(e.sender.url));
                        // monitor.trackFeatureValue("View load - '" + e.sender.url + "'",
                        //                           performance.now() - viewLoadTimeStamp);
                    }),

                    sameViewRequested: proxy(function(e) {
                        monitor.trackFeature('SameViewRequests.' + getViewName(e.sender.url));
                    }),

                    viewTypeDetermined: proxy(function(e) {
                        if (e.url) {
                            // Navigation request
                            monitor.trackFeature('Views.' + getViewName(e.url));
                        }
                    }),

                    viewShow: proxy(function (e) {
                        viewInteractionTimeStamp = performance.now();
                        var name = getViewName(e.view);
                        monitor.trackFeatureStart('ViewsInteraction.' + name);
                        monitor.trackFeatureStop('ViewsShow.' + name);
                    })
                },

                viewContainerEvents: {
                    accepted: proxy(this.bindViewEvents)
                },

                viewEvents: {
                    init: function (e) {
                        viewRenderTimeStamp = performance.now();
                        monitor.trackFeatureStart('ViewsRender.' + getViewName(e.view));

                        if (e.view && e.view.panes) {
                            $.each(e.view.panes, function () {
                                this.viewEngine.bind(that.viewEngineEvents);
                                this.viewEngine.viewContainer.bind(that.viewContainerEvents);
                            });
                        }
                    },

                    beforeShow: function () {
                        viewRenderTimeStamp = performance.now();
                    },

                    show: proxy(function(e) {
                        viewShowTimeStamp = performance.now();
                        var name = getViewName(e.view);
                        monitor.trackFeatureStop('ViewsRender.' + name);
                        monitor.trackFeatureStart('ViewsShow.' + name);
                    }),

                    beforeHide: proxy(function (e) {
                        monitor.trackFeatureStop('ViewsInteraction.' + getViewName(e.view));
                    })
                },

                relEvents: {
                    open: proxy(function (e) {
                        if (!e.sender.AlreadyOpened) {
                            //monitor.trackFeatureValue(e.sender.options.name + " open", "#" + e.sender.element.attr("id"));
                        }

                        e.sender.AlreadyOpened = true;
                    }),
                    close: proxy(function (e) {
                        //monitor.trackFeatureValue(e.sender.options.name + " close", "#" + e.sender.element.attr("id"));
                        e.sender.AlreadyOpened = false;
                    })
                }
            });

            Analytics.prototype.relEvents.show = Analytics.prototype.relEvents.open;
            Analytics.prototype.relEvents.hide = Analytics.prototype.relEvents.close;
        };


    var kendo = window.kendo,
        oldPlatform;

    if (kendo && kendo.mobile && kendo.mobile.Application) {
        oldPlatform = kendo.mobile.Application.prototype._setupPlatform;

        kendo.mobile.Application.prototype._setupPlatform = function () {
            var pane = kendo.mobile.ui.Pane,
                $ = window.jQuery,
                oldMouseup = pane.prototype._mouseup;

            $.extend(pane.prototype, {
                _mouseup: function(e) {
                    var target = e.currentTarget, rel, href, text, feature,
                        isBack = target.hash === "#:back",
                        view = kendo.widgetInstance($(target).closest(".km-view"), kendo.mobile.ui);

                    if (target && (view.trackingEnabled || isBack)) {
                        feature = target.getAttribute("data-track-feature");
                        rel = target.getAttribute("data-rel");
                        href = target.getAttribute("href");
                        text = target.textContent || target.getAttribute("data-icon");

                        if (typeof feature !== 'undefined' && feature !== null) {
                            monitor.trackFeature(feature);
                        }

                        // if (isBack) {
                        //     monitor.trackFeatureValue("Navigation request", target.hash);
                        // } else {
                        //     monitor.trackFeatureValue("App link click", text);
                        // }
                    }

                    if (rel in relatives) {
                        if (rel != "external") {
                            var widget = kendo.widgetInstance($(href), kendo.mobile.ui);

                            if (!widget.BoundRelatives) {
                                widget.bind(analytics.relEvents);
                                analytics.bindViewEvents({ view: widget });

                                if (widget.pane && widget.pane.viewEngine !== analytics.viewEngine) {
                                    widget.pane.viewEngine.bind(analytics.viewEngineEvents);
                                    widget.pane.viewEngine.viewContainer.bind(analytics.viewContainerEvents);
                                }

                                widget.BoundRelatives = true;
                            }
                        }

                        var featureName = 'Widgets.' + relatives[rel];
                        monitor.trackFeature(featureName);
                    }

                    oldMouseup.apply(this, arguments);
                }
            });

            analytics = new Analytics();

            oldPlatform.apply(this, arguments);

            this.bind("init", analytics.init);
        };
    }
})(window);
