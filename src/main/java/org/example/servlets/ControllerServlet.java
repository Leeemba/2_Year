package org.example.servlets;

import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

@WebServlet("/controller")
public class ControllerServlet extends HttpServlet {

    // Допустимые значения для R
    private final Set<String> VALID_R_VALUES = Set.of("1", "1.5", "2", "2.5", "3");



    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        processRequest(request, response);
    }

    public void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {

        if ("clear".equals(request.getParameter("action"))) {
            request.getSession().removeAttribute("points");
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":\"success\"}");
            return;
        }

        final var INVALID_DATA_MSG = "Please set the data values in correct form.";

        try {
            if (
                    request.getParameter("R") == null
                            || request.getParameter("X") == null
                            || request.getParameter("Y") == null
            ) {
                sendError(response, INVALID_DATA_MSG);
                return;
            }
            if (
                    request.getParameter("R").isEmpty()
                            || request.getParameter("X").isEmpty()
                            || request.getParameter("Y").isEmpty()
            ) {
                sendError(response, INVALID_DATA_MSG);
                return;
            }


            String rParam = request.getParameter("R");

            // Валидация R
            if (!VALID_R_VALUES.contains(rParam)) {
                sendError(response, "Invalid R value. R must be one of: 1, 1.5, 2, 2.5, 3");
                return;
            }

            double y;
            try {
                y = Double.parseDouble(request.getParameter("Y"));
            }catch (NumberFormatException e) {
                sendError(response, INVALID_DATA_MSG);
                return;
            }

            if (y < -5 || y > 5) {
                sendError(response, INVALID_DATA_MSG);
                return;
            }

            Double.parseDouble(request.getParameter("X"));
            Float.parseFloat(request.getParameter("R"));

            // Устанавливаем флаг в сессии, что валидация пройдена
            request.getSession().setAttribute("validationPassed", true);

            response.sendRedirect("./checkArea?" + request.getQueryString());
        } catch (Exception e) {
            sendError(response, e.toString());
        }
    }

    private void sendError(HttpServletResponse response, String errorMessage) throws IOException {
        response.resetBuffer();
        response.setStatus(422);
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            var json = new Gson();
            Map<String, Object> jsonResponse = new LinkedHashMap<>();
            jsonResponse.put("error", errorMessage);
            jsonResponse.put("status", "UNPROCESSABLE_ENTITY");

            String jsonOutput = json.toJson(jsonResponse);
            PrintWriter writer = response.getWriter();
            writer.write(jsonOutput);
            writer.flush();
        } catch (Exception e) {
            try {
                response.getWriter().write("{\"error\":\"Validation error\"}");
                response.getWriter().flush();
            } catch (Exception ignored) {}
        }
    }
}
