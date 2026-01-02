#!/bin/bash

# Radiology Orchestration System - Setup Verification Script
# This script automatically checks if your system is set up correctly

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Radiology Orchestration System - Setup Verification      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Function to check a condition
check() {
    local description="$1"
    local command="$2"
    
    printf "%-60s" "$description"
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ FAIL"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Function to check with output
check_output() {
    local description="$1"
    local command="$2"
    local expected="$3"
    
    printf "%-60s" "$description"
    
    output=$(eval "$command" 2>&1)
    
    if echo "$output" | grep -q "$expected"; then
        echo "✅ PASS"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ FAIL"
        echo "   Expected: $expected"
        echo "   Got: $output"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "=== PHASE 1: Prerequisites ==="
echo ""

check "Docker installed" "docker --version"
check "Docker Compose installed" "docker-compose --version"
check "Docker daemon running" "docker ps"

echo ""
echo "=== PHASE 2: Docker Containers ==="
echo ""

check "PostgreSQL container running" "docker ps | grep radiology-postgres"
check "Redis container running" "docker ps | grep radiology-redis"
check "Backend container running" "docker ps | grep radiology-backend"
check "Frontend container running" "docker ps | grep radiology-frontend"

echo ""
echo "=== PHASE 3: Container Health ==="
echo ""

check "PostgreSQL healthy" "docker exec radiology-postgres pg_isready"
check "Redis healthy" "docker exec radiology-redis redis-cli ping"
check "Backend responding" "docker exec radiology-backend node --version"

echo ""
echo "=== PHASE 4: Network Connectivity ==="
echo ""

check "Backend API accessible" "curl -s http://localhost:3001/api/radiologists > /dev/null"
check "Frontend accessible" "curl -s http://localhost:3000 > /dev/null"

echo ""
echo "=== PHASE 5: API Endpoints ==="
echo ""

check_output "Radiologists API working" "curl -s http://localhost:3001/api/radiologists" "Dr. Smith"
check_output "Audit API working" "curl -s http://localhost:3001/api/audit" "timestamp"
check_output "Exams API working" "curl -s http://localhost:3001/api/exams" "\[\]"

echo ""
echo "=== PHASE 6: Database ==="
echo ""

check "Database exists" "docker exec radiology-postgres psql -U postgres -lqt | grep radiology_db"
check "Radiologists table exists" "docker exec radiology-postgres psql -U postgres -d radiology_db -c '\dt radiologists'"
check "Exams table exists" "docker exec radiology-postgres psql -U postgres -d radiology_db -c '\dt exams'"
check "Audit logs table exists" "docker exec radiology-postgres psql -U postgres -d radiology_db -c '\dt audit_logs'"

echo ""
echo "=== PHASE 7: Seed Data ==="
echo ""

check_output "Radiologists seeded" "docker exec radiology-postgres psql -U postgres -d radiology_db -t -c 'SELECT COUNT(*) FROM radiologists'" "5"
check_output "CPT codes seeded" "docker exec radiology-postgres psql -U postgres -d radiology_db -t -c 'SELECT COUNT(*) FROM cpt_codes'" "10"

echo ""
echo "=== PHASE 8: Redis Operations ==="
echo ""

check "Redis accepting connections" "docker exec radiology-redis redis-cli SET test_key test_value"
check "Redis can read keys" "docker exec radiology-redis redis-cli GET test_key"

# Cleanup test key
docker exec radiology-redis redis-cli DEL test_key > /dev/null 2>&1

echo ""
echo "=== PHASE 9: Functional Tests ==="
echo ""

# Create a test exam
TEST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/hl7/mock-exam)
check_output "Can create mock exam" "echo '$TEST_RESPONSE'" "success"

# Wait a moment for auto-assignment
sleep 2

# Check if exam was created
check "Exam appears in database" "curl -s http://localhost:3001/api/exams | grep -q accessionNumber"

# Check if audit log recorded it
check "Audit log has entries" "curl -s http://localhost:3001/api/audit | grep -q EXAM_INGESTED"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     VERIFICATION SUMMARY                   ║"
echo "╠════════════════════════════════════════════════════════════╣"
printf "║  ✅ Passed: %-45s║\n" "$PASS_COUNT tests"
printf "║  ❌ Failed: %-45s║\n" "$FAIL_COUNT tests"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 SUCCESS! Your system is fully operational!"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Click 'Ingest Mock HL7 Exam' to test the system"
    echo "  3. Watch auto-assignment in action"
    echo "  4. Check the audit log for detailed tracking"
    echo ""
    exit 0
else
    echo "⚠️  WARNING: $FAIL_COUNT tests failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check logs: docker-compose logs -f"
    echo "  2. Restart services: docker-compose restart"
    echo "  3. If problems persist: docker-compose down -v && docker-compose up -d"
    echo ""
    echo "For detailed logs of a specific service:"
    echo "  docker-compose logs backend"
    echo "  docker-compose logs postgres"
    echo "  docker-compose logs redis"
    echo "  docker-compose logs frontend"
    echo ""
    exit 1
fi
