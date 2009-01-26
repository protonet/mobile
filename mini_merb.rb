# run very flat apps with merb -I <app file>.

# Uncomment for DataMapper ORM
use_orm :datamapper

dm_gems_version   = "0.9.9"

dependency "dm-core", dm_gems_version         
dependency "dm-aggregates", dm_gems_version   
dependency "dm-migrations", dm_gems_version   
dependency "dm-timestamps", dm_gems_version   
dependency "dm-types", dm_gems_version        
dependency "dm-validations", dm_gems_version


Merb::Config.use { |c|
  c[:framework]           = { :public => [Merb.root / "public", nil] }
  c[:session_store]       = 'none'
  c[:exception_details]   = true
	c[:log_level]           = :debug # or error, warn, info or fatal
  c[:log_stream]          = STDOUT
  # or use file for loggine:
  # c[:log_file]          = Merb.root / "log" / "merb.log"

	c[:reload_classes]   = false
	c[:reload_templates] = false
}