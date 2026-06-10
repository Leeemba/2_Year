package org.example.servlets;

import com.google.gson.Gson;

import org.example.models.Point;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/checkArea")
public class AreaCheckServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    private void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            var x = Double.parseDouble(request.getParameter("X"));
            var y = Double.parseDouble(request.getParameter("Y"));
            var r = Float.parseFloat(request.getParameter("R"));
            var point = new Point(x, y, r);

            var session = request.getSession();

            @SuppressWarnings("unchecked")
            var points = (List<Point>) session.getAttribute("points");
            if (points == null) {
                points = new ArrayList<>();
                session.setAttribute("points", points);
            }
            points.add(point);

            session.setAttribute("lastX", x);
            session.setAttribute("lastY", y);
            session.setAttribute("lastR", r);

            var action = request.getParameter("action");
            if ("submitForm".equals(action)) {
                request.setAttribute("X", x);
                request.setAttribute("Y", y);
                request.setAttribute("R", r);
                request.setAttribute("result", point.isInArea());

                var dispatcher = request.getRequestDispatcher("./result.jsp");
                dispatcher.forward(request, response);

            } else if ("checkPoint".equals(action)) {
                var gson = new Gson();
                Map<String, Object> json = new HashMap<>();
                json.put("x", x);
                json.put("y", y);
                json.put("r", r);
                json.put("result", point.isInArea());
                var msg = gson.toJson(json);

                response.setContentType("application/json");
                response.getWriter().write(msg);
            }
        } catch (Exception e) {
            request.getRequestDispatcher("./index.jsp").forward(request, response);
        }
    }
}
