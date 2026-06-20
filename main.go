package main

import (
	"bufio"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// Models matching schema.prisma database layout
type Hackathon struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Description     *string   `json:"description"`
	StartDate       time.Time `json:"startDate"`
	EndDate         time.Time `json:"endDate"`
	TeamSize        int       `json:"teamSize"`
	Type            string    `json:"type"`
	Phases          *string   `json:"phases"`
	Image           *string   `json:"image"`
	PrizeFirst      *string   `json:"prizeFirst"`
	PrizeSecond     *string   `json:"prizeSecond"`
	PrizeThird      *string   `json:"prizeThird"`
	Perks           *string   `json:"perks"`
	RegistrationFee float64   `json:"registrationFee"`
	HasFee          bool      `json:"hasFee"`
	CreatedAt       time.Time `json:"createdAt"`
}

type Team struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	HackathonID string    `json:"hackathonId"`
	CreatedAt   time.Time `json:"createdAt"`
}

type Submission struct {
	ID        string    `json:"id"`
	GithubURL *string   `json:"githubUrl"`
	DemoURL   *string   `json:"demoUrl"`
	TeamID    string    `json:"teamId"`
	CreatedAt time.Time `json:"createdAt"`
}

func main() {
	// Load environment variables from local .env files
	loadEnv(".env.local", ".env")

	// Get database URL (prefer Direct connection string for Postgres driver robustness)
	connStr := os.Getenv("DIRECT_URL")
	if connStr == "" {
		connStr = os.Getenv("DATABASE_URL")
	}

	if connStr == "" {
		log.Fatal("Error: DATABASE_URL or DIRECT_URL environment variables not found")
	}

	// Connect to database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database connection: %v", err)
	}
	defer db.Close()

	// Verify database connection is alive
	if err := db.Ping(); err != nil {
		log.Fatalf("Database connection check failed: %v", err)
	}
	log.Println("Successfully connected to the PostgreSQL database.")

	// Set up multiplexer and registers routes
	mux := http.NewServeMux()

	// Hackathon CRUD operations
	mux.HandleFunc("GET /api/hackathons", handleListHackathons(db))
	mux.HandleFunc("POST /api/hackathons", handleCreateHackathon(db))
	mux.HandleFunc("GET /api/hackathons/{id}", handleGetHackathon(db))
	mux.HandleFunc("PUT /api/hackathons/{id}", handleUpdateHackathon(db))
	mux.HandleFunc("DELETE /api/hackathons/{id}", handleDeleteHackathon(db))

	// Team Registration
	mux.HandleFunc("POST /api/teams", handleCreateTeam(db))

	// Project Submissions
	mux.HandleFunc("POST /api/submissions", handleCreateSubmission(db))

	// Health Check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	port := os.Getenv("GO_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Go backend server listening on port %s...", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// Env Loader
func loadEnv(filenames ...string) {
	for _, filename := range filenames {
		file, err := os.Open(filename)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			if len(line) == 0 || line[0] == '#' {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) != 2 {
				continue
			}
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			if len(value) >= 2 && ((value[0] == '"' && value[len(value)-1] == '"') || (value[0] == '\'' && value[len(value)-1] == '\'')) {
				value = value[1 : len(value)-1]
			}
			if os.Getenv(key) == "" {
				os.Setenv(key, value)
			}
		}
	}
}

// Helpers
func respondWithError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   message,
	})
}

func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func generateUUID() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:]), nil
}

// Handlers
func handleListHackathons(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(`SELECT "id", "title", "description", "startDate", "endDate", "teamSize", "type", "phases", "image", "prizeFirst", "prizeSecond", "prizeThird", "perks", "registrationFee", "hasFee", "createdAt" FROM "Hackathon" ORDER BY "createdAt" DESC`)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		hackathons := []Hackathon{}
		for rows.Next() {
			var h Hackathon
			var desc, phases, image, p1, p2, p3, perks sql.NullString
			if err := rows.Scan(
				&h.ID, &h.Title, &desc, &h.StartDate, &h.EndDate, &h.TeamSize,
				&h.Type, &phases, &image, &p1, &p2, &p3, &perks,
				&h.RegistrationFee, &h.HasFee, &h.CreatedAt,
			); err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if desc.Valid {
				h.Description = &desc.String
			}
			if phases.Valid {
				h.Phases = &phases.String
			}
			if image.Valid {
				h.Image = &image.String
			}
			if p1.Valid {
				h.PrizeFirst = &p1.String
			}
			if p2.Valid {
				h.PrizeSecond = &p2.String
			}
			if p3.Valid {
				h.PrizeThird = &p3.String
			}
			if perks.Valid {
				h.Perks = &perks.String
			}
			hackathons = append(hackathons, h)
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    hackathons,
		})
	}
}

func handleCreateHackathon(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Title           string  `json:"title"`
			Description     string  `json:"description"`
			StartDate       string  `json:"startDate"`
			EndDate         string  `json:"endDate"`
			TeamSize        int     `json:"teamSize"`
			Type            string  `json:"type"`
			Phases          string  `json:"phases"`
			Image           string  `json:"image"`
			PrizeFirst      string  `json:"prizeFirst"`
			PrizeSecond     string  `json:"prizeSecond"`
			PrizeThird      string  `json:"prizeThird"`
			Perks           string  `json:"perks"`
			RegistrationFee float64 `json:"registrationFee"`
			HasFee          bool    `json:"hasFee"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if req.Title == "" || req.StartDate == "" || req.EndDate == "" || req.TeamSize <= 0 {
			respondWithError(w, http.StatusBadRequest, "Missing required fields")
			return
		}

		start, err := time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			start, err = time.Parse(time.RFC3339, req.StartDate)
			if err != nil {
				respondWithError(w, http.StatusBadRequest, "Invalid start date format")
				return
			}
		}

		end, err := time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			end, err = time.Parse(time.RFC3339, req.EndDate)
			if err != nil {
				respondWithError(w, http.StatusBadRequest, "Invalid end date format")
				return
			}
		}

		id, err := generateUUID()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate ID")
			return
		}

		var descVal, phasesVal, imageVal, p1Val, p2Val, p3Val, perksVal interface{}
		if req.Description != "" {
			descVal = req.Description
		}
		if req.Phases != "" {
			phasesVal = req.Phases
		}
		if req.Image != "" {
			imageVal = req.Image
		}
		if req.PrizeFirst != "" {
			p1Val = req.PrizeFirst
		}
		if req.PrizeSecond != "" {
			p2Val = req.PrizeSecond
		}
		if req.PrizeThird != "" {
			p3Val = req.PrizeThird
		}
		if req.Perks != "" {
			perksVal = req.Perks
		}

		hackathonType := req.Type
		if hackathonType == "" {
			hackathonType = "Online"
		}

		createdAt := time.Now()

		_, err = db.Exec(`INSERT INTO "Hackathon" (
			"id", "title", "description", "startDate", "endDate", "teamSize", 
			"type", "phases", "image", "prizeFirst", "prizeSecond", "prizeThird", 
			"perks", "registrationFee", "hasFee", "createdAt"
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
			id, req.Title, descVal, start, end, req.TeamSize,
			hackathonType, phasesVal, imageVal, p1Val, p2Val, p3Val,
			perksVal, req.RegistrationFee, req.HasFee, createdAt,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		var descPtr, phasesPtr, imagePtr, p1Ptr, p2Ptr, p3Ptr, perksPtr *string
		if req.Description != "" {
			d := req.Description
			descPtr = &d
		}
		if req.Phases != "" {
			ph := req.Phases
			phasesPtr = &ph
		}
		if req.Image != "" {
			im := req.Image
			imagePtr = &im
		}
		if req.PrizeFirst != "" {
			pr1 := req.PrizeFirst
			p1Ptr = &pr1
		}
		if req.PrizeSecond != "" {
			pr2 := req.PrizeSecond
			p2Ptr = &pr2
		}
		if req.PrizeThird != "" {
			pr3 := req.PrizeThird
			p3Ptr = &pr3
		}
		if req.Perks != "" {
			pe := req.Perks
			perksPtr = &pe
		}

		h := Hackathon{
			ID:              id,
			Title:           req.Title,
			Description:     descPtr,
			StartDate:       start,
			EndDate:         end,
			TeamSize:        req.TeamSize,
			Type:            hackathonType,
			Phases:          phasesPtr,
			Image:           imagePtr,
			PrizeFirst:      p1Ptr,
			PrizeSecond:     p2Ptr,
			PrizeThird:      p3Ptr,
			Perks:           perksPtr,
			RegistrationFee: req.RegistrationFee,
			HasFee:          req.HasFee,
			CreatedAt:       createdAt,
		}

		respondWithJSON(w, http.StatusCreated, map[string]interface{}{
			"success": true,
			"data":    h,
		})
	}
}

func handleGetHackathon(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			respondWithError(w, http.StatusBadRequest, "Missing hackathon ID")
			return
		}

		var h Hackathon
		var desc, phases, image, p1, p2, p3, perks sql.NullString
		err := db.QueryRow(`SELECT 
			"id", "title", "description", "startDate", "endDate", "teamSize", 
			"type", "phases", "image", "prizeFirst", "prizeSecond", "prizeThird", 
			"perks", "registrationFee", "hasFee", "createdAt" 
			FROM "Hackathon" WHERE "id" = $1`, id).Scan(
			&h.ID, &h.Title, &desc, &h.StartDate, &h.EndDate, &h.TeamSize,
			&h.Type, &phases, &image, &p1, &p2, &p3, &perks,
			&h.RegistrationFee, &h.HasFee, &h.CreatedAt,
		)

		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusNotFound, "Hackathon not found")
			return
		} else if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if desc.Valid {
			h.Description = &desc.String
		}
		if phases.Valid {
			h.Phases = &phases.String
		}
		if image.Valid {
			h.Image = &image.String
		}
		if p1.Valid {
			h.PrizeFirst = &p1.String
		}
		if p2.Valid {
			h.PrizeSecond = &p2.String
		}
		if p3.Valid {
			h.PrizeThird = &p3.String
		}
		if perks.Valid {
			h.Perks = &perks.String
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    h,
		})
	}
}

func handleUpdateHackathon(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			respondWithError(w, http.StatusBadRequest, "Missing hackathon ID")
			return
		}

		var req struct {
			Title           *string  `json:"title"`
			Description     *string  `json:"description"`
			StartDate       *string  `json:"startDate"`
			EndDate         *string  `json:"endDate"`
			TeamSize        *int     `json:"teamSize"`
			Type            *string  `json:"type"`
			Phases          *string  `json:"phases"`
			Image           *string  `json:"image"`
			PrizeFirst      *string  `json:"prizeFirst"`
			PrizeSecond     *string  `json:"prizeSecond"`
			PrizeThird      *string  `json:"prizeThird"`
			Perks           *string  `json:"perks"`
			RegistrationFee *float64 `json:"registrationFee"`
			HasFee          *bool    `json:"hasFee"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		var existing Hackathon
		var desc, phases, image, p1, p2, p3, perks sql.NullString
		err := db.QueryRow(`SELECT 
			"id", "title", "description", "startDate", "endDate", "teamSize", 
			"type", "phases", "image", "prizeFirst", "prizeSecond", "prizeThird", 
			"perks", "registrationFee", "hasFee", "createdAt" 
			FROM "Hackathon" WHERE "id" = $1`, id).Scan(
			&existing.ID, &existing.Title, &desc, &existing.StartDate, &existing.EndDate, &existing.TeamSize,
			&existing.Type, &phases, &image, &p1, &p2, &p3, &perks,
			&existing.RegistrationFee, &existing.HasFee, &existing.CreatedAt,
		)

		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusNotFound, "Hackathon not found")
			return
		} else if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if desc.Valid {
			existing.Description = &desc.String
		}
		if phases.Valid {
			existing.Phases = &phases.String
		}
		if image.Valid {
			existing.Image = &image.String
		}
		if p1.Valid {
			existing.PrizeFirst = &p1.String
		}
		if p2.Valid {
			existing.PrizeSecond = &p2.String
		}
		if p3.Valid {
			existing.PrizeThird = &p3.String
		}
		if perks.Valid {
			existing.Perks = &perks.String
		}

		title := existing.Title
		if req.Title != nil {
			title = *req.Title
		}

		var descriptionVal interface{}
		if req.Description != nil {
			if *req.Description == "" {
				descriptionVal = nil
			} else {
				descriptionVal = *req.Description
			}
		} else {
			if existing.Description != nil {
				descriptionVal = *existing.Description
			}
		}

		start := existing.StartDate
		if req.StartDate != nil {
			var err error
			start, err = time.Parse("2006-01-02", *req.StartDate)
			if err != nil {
				start, err = time.Parse(time.RFC3339, *req.StartDate)
				if err != nil {
					respondWithError(w, http.StatusBadRequest, "Invalid start date format")
					return
				}
			}
		}

		end := existing.EndDate
		if req.EndDate != nil {
			var err error
			end, err = time.Parse("2006-01-02", *req.EndDate)
			if err != nil {
				end, err = time.Parse(time.RFC3339, *req.EndDate)
				if err != nil {
					respondWithError(w, http.StatusBadRequest, "Invalid end date format")
					return
				}
			}
		}

		teamSize := existing.TeamSize
		if req.TeamSize != nil {
			teamSize = *req.TeamSize
		}

		hackathonType := existing.Type
		if req.Type != nil {
			hackathonType = *req.Type
		}

		var phasesVal interface{}
		if req.Phases != nil {
			if *req.Phases == "" {
				phasesVal = nil
			} else {
				phasesVal = *req.Phases
			}
		} else {
			if existing.Phases != nil {
				phasesVal = *existing.Phases
			}
		}

		var imageVal interface{}
		if req.Image != nil {
			if *req.Image == "" {
				imageVal = nil
			} else {
				imageVal = *req.Image
			}
		} else {
			if existing.Image != nil {
				imageVal = *existing.Image
			}
		}

		var p1Val interface{}
		if req.PrizeFirst != nil {
			if *req.PrizeFirst == "" {
				p1Val = nil
			} else {
				p1Val = *req.PrizeFirst
			}
		} else {
			if existing.PrizeFirst != nil {
				p1Val = *existing.PrizeFirst
			}
		}

		var p2Val interface{}
		if req.PrizeSecond != nil {
			if *req.PrizeSecond == "" {
				p2Val = nil
			} else {
				p2Val = *req.PrizeSecond
			}
		} else {
			if existing.PrizeSecond != nil {
				p2Val = *existing.PrizeSecond
			}
		}

		var p3Val interface{}
		if req.PrizeThird != nil {
			if *req.PrizeThird == "" {
				p3Val = nil
			} else {
				p3Val = *req.PrizeThird
			}
		} else {
			if existing.PrizeThird != nil {
				p3Val = *existing.PrizeThird
			}
		}

		var perksVal interface{}
		if req.Perks != nil {
			if *req.Perks == "" {
				perksVal = nil
			} else {
				perksVal = *req.Perks
			}
		} else {
			if existing.Perks != nil {
				perksVal = *existing.Perks
			}
		}

		regFee := existing.RegistrationFee
		if req.RegistrationFee != nil {
			regFee = *req.RegistrationFee
		}

		hasFee := existing.HasFee
		if req.HasFee != nil {
			hasFee = *req.HasFee
		}

		_, err = db.Exec(`UPDATE "Hackathon" SET 
			"title" = $1, "description" = $2, "startDate" = $3, "endDate" = $4, "teamSize" = $5,
			"type" = $6, "phases" = $7, "image" = $8, "prizeFirst" = $9, "prizeSecond" = $10,
			"prizeThird" = $11, "perks" = $12, "registrationFee" = $13, "hasFee" = $14
			WHERE "id" = $15`,
			title, descriptionVal, start, end, teamSize,
			hackathonType, phasesVal, imageVal, p1Val, p2Val, p3Val,
			perksVal, regFee, hasFee, id,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		var descPtr, phasesPtr, imagePtr, p1Ptr, p2Ptr, p3Ptr, perksPtr *string
		if descriptionVal != nil {
			d := descriptionVal.(string)
			descPtr = &d
		}
		if phasesVal != nil {
			ph := phasesVal.(string)
			phasesPtr = &ph
		}
		if imageVal != nil {
			im := imageVal.(string)
			imagePtr = &im
		}
		if p1Val != nil {
			pr1 := p1Val.(string)
			p1Ptr = &pr1
		}
		if p2Val != nil {
			pr2 := p2Val.(string)
			p2Ptr = &pr2
		}
		if p3Val != nil {
			pr3 := p3Val.(string)
			p3Ptr = &pr3
		}
		if perksVal != nil {
			pe := perksVal.(string)
			perksPtr = &pe
		}

		h := Hackathon{
			ID:              id,
			Title:           title,
			Description:     descPtr,
			StartDate:       start,
			EndDate:         end,
			TeamSize:        teamSize,
			Type:            hackathonType,
			Phases:          phasesPtr,
			Image:           imagePtr,
			PrizeFirst:      p1Ptr,
			PrizeSecond:     p2Ptr,
			PrizeThird:      p3Ptr,
			Perks:           perksPtr,
			RegistrationFee: regFee,
			HasFee:          hasFee,
			CreatedAt:       existing.CreatedAt,
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    h,
		})
	}
}

func handleDeleteHackathon(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			respondWithError(w, http.StatusBadRequest, "Missing hackathon ID")
			return
		}

		var exists bool
		err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Hackathon" WHERE "id" = $1)`, id).Scan(&exists)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if !exists {
			respondWithError(w, http.StatusNotFound, "Hackathon not found")
			return
		}

		_, err = db.Exec(`DELETE FROM "Hackathon" WHERE "id" = $1`, id)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"message": "Hackathon deleted successfully",
		})
	}
}

func handleCreateTeam(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name        string `json:"name"`
			HackathonID string `json:"hackathonId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if req.Name == "" || req.HackathonID == "" {
			respondWithError(w, http.StatusBadRequest, "Missing name or hackathonId")
			return
		}

		var hackathonExists bool
		err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Hackathon" WHERE "id" = $1)`, req.HackathonID).Scan(&hackathonExists)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if !hackathonExists {
			respondWithError(w, http.StatusNotFound, "Hackathon not found")
			return
		}

		id, err := generateUUID()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate ID")
			return
		}

		createdAt := time.Now()

		_, err = db.Exec(`INSERT INTO "Team" ("id", "name", "hackathonId", "createdAt") VALUES ($1, $2, $3, $4)`,
			id, req.Name, req.HackathonID, createdAt)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		t := Team{
			ID:          id,
			Name:        req.Name,
			HackathonID: req.HackathonID,
			CreatedAt:   createdAt,
		}

		respondWithJSON(w, http.StatusCreated, map[string]interface{}{
			"success": true,
			"data":    t,
		})
	}
}

func handleCreateSubmission(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			TeamID    string  `json:"teamId"`
			GithubURL *string `json:"githubUrl"`
			DemoURL   *string `json:"demoUrl"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if req.TeamID == "" {
			respondWithError(w, http.StatusBadRequest, "Missing teamId")
			return
		}

		var teamExists bool
		err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Team" WHERE "id" = $1)`, req.TeamID).Scan(&teamExists)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if !teamExists {
			respondWithError(w, http.StatusNotFound, "Team ID not found. Make sure you entered a valid Team ID.")
			return
		}

		id, err := generateUUID()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate ID")
			return
		}

		createdAt := time.Now()

		_, err = db.Exec(`INSERT INTO "Submission" ("id", "githubUrl", "demoUrl", "teamId", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
			id, req.GithubURL, req.DemoURL, req.TeamID, createdAt)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		s := Submission{
			ID:        id,
			GithubURL: req.GithubURL,
			DemoURL:   req.DemoURL,
			TeamID:    req.TeamID,
			CreatedAt: createdAt,
		}

		respondWithJSON(w, http.StatusCreated, map[string]interface{}{
			"success": true,
			"data":    s,
		})
	}
}
