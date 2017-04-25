package server;

import static io.undertow.servlet.Servlets.defaultContainer;
import static io.undertow.servlet.Servlets.deployment;
import static io.undertow.servlet.Servlets.servlet;

import javax.servlet.ServletException;

import io.undertow.Handlers;
import io.undertow.Undertow;
import io.undertow.server.HttpHandler;
import io.undertow.server.handlers.PathHandler;
import io.undertow.servlet.api.DeploymentInfo;
import io.undertow.servlet.api.DeploymentManager;

public class MainServlet {
    public MainServlet() throws Exception {

    }

    public static final String PATH = "/";

    /**
     * Function to configure the main servlet
     * @param args
     */
    public static void main(String[] args) {
        try {
            DeploymentInfo servletBuilder = deployment()
                    .setClassLoader(MainServlet.class.getClassLoader())
                    .setContextPath(PATH)
                    .setDeploymentName("handler.war")
                    .addServlets(
                            servlet("DataAnalysisServlet", DataAnalysisServlet.class)
                            .addMapping("/analysis")
                    );

            DeploymentManager manager = defaultContainer().addDeployment(servletBuilder);
            manager.deploy();

            HttpHandler servletHandler = manager.start();
            PathHandler path = Handlers.path(Handlers.redirect(PATH))
                    .addPrefixPath(PATH, servletHandler);

            Undertow server = Undertow.builder()
                    .addHttpListener(8080, "0.0.0.0")
                    .setHandler(path)
                    .build();
            server.start();

        } catch (ServletException e) {
            throw new RuntimeException(e);
        }
    }
}
