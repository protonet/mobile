input_console = new InputConsole({"input_console": $("#message")});
Dispatcher    = new DispatchingSystem(document.getElementById('flash_socket'), config.dispatching_server, config.token, config.user_id);
