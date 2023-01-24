//
//  main.cpp
//  Chatbot version 1.0
//  Created by Ingenuity i/o on 2023/01/24
//
//  no description
//  Copyright © 2022 Ingenuity i/o. All rights reserved.
//

#if defined(__unix__) || defined(__linux__) || (defined(__APPLE__) && defined(__MACH__))
    #include <pthread.h>
#elif (defined WIN32 || defined _WIN32)
    #ifndef WIN32_LEAN_AND_MEAN
        #define WIN32_LEAN_AND_MEAN
    #endif
    #define NOMINMAX
    #include <windows.h>
    #include <winsock2.h>
#endif

#include <getopt.h>
#include <iostream>
#include <sstream>
#include <string>
#include <string_view>

#ifdef INGESCAPE_FROM_PRI
#include "ingescape.h"
#else
#include <ingescape/ingescape.h>
#endif // INGESCAPE_FROM_PRI

#include "Chatbot.h"

//default agent parameters to be overriden by command line parameters
static constexpr int PORT = 5670;
static constexpr std::string_view AGENT_NAME = "Chatbot";
static constexpr std::string_view DEVICE = "";
static constexpr bool IS_VERBOSE = false;

int ingescapeSentMessage(zloop_t *loop, zsock_t *reader, void *arg){
    char *message = nullptr;
    zsock_recv(reader, "s", &message);
    if (streq(message, "LOOP_STOPPED")){
        igs_info("LOOP_STOPPED received from Ingescape");
        return -1;
    }else
        return 0;
}

//inputs
void CommandInputCallback(igs_iop_type_t iopType, const char* name, igs_iop_value_type_t valueType,
	                    void* value, size_t valueSize, void* myData) {
    Chatbot *agent = static_cast<Chatbot *>(myData);
    igs_info("%s changed (impulsion)", name);
    agent->setCommandI();
}


///////////////////////////////////////////////////////////////////////////////
// COMMAND LINE AND INTERPRETER OPTIONS
//
void print_usage(void){
    std::cout << "Usage examples:" << std::endl;
    std::cout << "    ./Chatbot --verbose --device en0 --port 5670" << std::endl << std::endl;
    std::cout << "Ingescape parameters:" << std::endl;
    std::cout << "--verbose : enable verbose mode in the application (default is disabled)" << std::endl;
    std::cout << "--device device_name : name of the network device to be used (useful if several devices are available)" << std::endl;
    std::cout << "--port port_number : port used for autodiscovery between agents (default: " << PORT << ")" << std::endl;
    std::cout << "--name agent_name : published name of this agent (default: " << AGENT_NAME << ")" << std::endl;
    std::cout << "--interactiveloop : enables interactive loop to pass commands in CLI (default: false)" << std::endl;
    std::cout << "Security:" << std::endl;
    std::cout << "--igsCert filePath : path to a private certificate used to connect to a secure platform" << std::endl;
    std::cout << "--publicCerts directoryPath : path to a directory providing public certificates usable by ingescape" << std::endl;
    std::cout << "" << std::endl;
}

//resolve paths starting with ~ to absolute paths
void resolveUserPathIn(std::string& path) {
    if (path[0] == '~') {
#ifdef _WIN32
        char *home = getenv("USERPROFILE");
#else
        char *home = getenv("HOME");
#endif
        if (!home)
            igs_error("could not find path for home directory");
        else
            path.replace(0, 1, home);
    }
}

void print_cli_usage(void) {
    std::cout << "Available commands in the terminal:" << std::endl;
    std::cout << "\t/quit : quits the agent" << std::endl;
    std::cout << "\t/help : displays this message" << std::endl;
}

///////////////////////////////////////////////////////////////////////////////
// MAIN & OPTIONS & COMMAND INTERPRETER
//
//
int main(int argc, const char * argv[]) {
    int opt = 0;
    bool verbose = IS_VERBOSE;
    std::string networkDevice = DEVICE.data();
    unsigned int port = PORT;
    std::string agentName = AGENT_NAME.data();
    bool interactiveloop = false;
    std::string igsCertPath;
    std::string publicCertsDir;

    static struct option long_options[] = {
        {"verbose",     no_argument, 0,  'v' },
        {"device",      required_argument, 0,  'd' },
        {"port",        required_argument, 0,  'p' },
        {"name",        required_argument, 0,  'n' },
        {"interactiveloop", no_argument, 0,  'i' },
        {"help",        no_argument, 0,  'h' },
        {"igsCert",        required_argument, 0,  'c' },
        {"publicCerts",        required_argument, 0,  's' },
        {0, 0, 0, 0}
    };

    int long_index = 0;
    while ((opt = getopt_long(argc, (char *const *)argv, "p", long_options, &long_index)) != -1) {
        switch (opt) {
            case 'v':
                verbose = true;
                break;
            case 'd':
                networkDevice = optarg;
                break;
            case 'p':
                port = (unsigned int)atoi(optarg);
                break;
            case 'n':
                agentName = optarg;
                break;
            case 'i':
                interactiveloop = true;
                break;
            case 'h':
                print_usage();
                exit(IGS_SUCCESS);
            case 'c':
                if (strlen(optarg) <= IGS_MAX_PATH_LENGTH)
                    igsCertPath = optarg;
                break;
            case 's':
                if (strlen(optarg) <= IGS_MAX_PATH_LENGTH)
                    publicCertsDir = optarg;
                break;
            default:
//                print_usage();
//                exit(IGS_FAILURE);
                break;
        }
    }

    igs_agent_set_name(agentName.c_str());
    igs_log_set_console(verbose);
    igs_log_set_file(true, nullptr);
    igs_log_set_stream(verbose);
    igs_definition_set_version("1.0");
    igs_set_command_line_from_args(argc, static_cast<const char**>(argv));

    //security
    resolveUserPathIn(igsCertPath);
    if (!igsCertPath.empty() && zfile_exists(igsCertPath.c_str()))
        assert(igs_enable_security(igsCertPath.c_str(), publicCertsDir.c_str()) == IGS_SUCCESS);
    else if (!igsCertPath.empty()){
        igs_error("Could not find Ingescape certificate file '%s': exiting", igsCertPath.c_str());
        exit(IGS_FAILURE);
    }

    if (networkDevice.empty()){
        //we have no device to start with: try to find one
        int nbD = 0;
        int nbA = 0;
        char **devices = igs_net_devices_list(&nbD);
        char **addresses = igs_net_addresses_list(&nbA);
        assert(nbD == nbA);
        if (nbD == 1) {
            //we have exactly one compliant network device available: we use it
            networkDevice = devices[0];
            igs_info("using %s as default network device (this is the only one available)", networkDevice.c_str());
        } else if (nbD == 2 && (strcmp(addresses[0], "127.0.0.1") == 0 || strcmp(addresses[1], "127.0.0.1") == 0)) {
            //we have two devices, one of which is the loopback
            //pick the device that is NOT the loopback
            if (strcmp(addresses[0], "127.0.0.1") == 0) {
                networkDevice = devices[1];
            } else {
                networkDevice = devices[0];
            }
            igs_info("using %s as default network device (this is the only one available that is not the loopback)", networkDevice.c_str());
        } else {
            if (nbD == 0) {
                igs_error("No network device found: aborting.");
            } else {
                igs_error("No network device passed as command line parameter and several are available.");
                std::cout << "Please use one of these network devices:" << std::endl;
                for (int i = 0; i < nbD; i++)
                    std::cout << "    " << devices[i] << std::endl;

                std::cout << std::endl;
                print_usage();
            }
            exit(1);
        }
        igs_free_net_devices_list(devices, nbD);
        igs_free_net_addresses_list(addresses, nbD);
    }

    igs_input_create("Command", IGS_IMPULSION_T, 0, 0);
    igs_output_create("JSON", IGS_IMPULSION_T, 0, 0);

    //initialize agent
    Chatbot *agent = new Chatbot();
    igs_observe_input("Command", CommandInputCallback, agent);

    //actually start ingescape
    igs_start_with_device(networkDevice.c_str(), port);

    //mai