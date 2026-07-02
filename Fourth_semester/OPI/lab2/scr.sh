#!/bin/bash

git init
git config user.name "red"
git config user.email "red@mail.com"

git switch -c br1

cp -f ./commits/commit0/* ./
git add .
git commit -m "r0"

cp -f ./commits/commit1/* ./
git add .
git commit -m "r1"

cp -f ./commits/commit2/* ./
git add .
git commit -m "r2"

git config user.name "blue"
git config user.email "blue@mail.com"

git switch -c br2

cp -f ./commits/commit3/* ./
git add .
git commit -m "r3"

cp -f ./commits/commit4/* ./
git add .
git commit -m "r4"

git switch -c br3

cp -f ./commits/commit5/* ./
git add .
git commit -m "r5"

git switch br2

cp -f ./commits/commit6/* ./
git add .
git commit -m "r6"

git switch br3

cp -f ./commits/commit7/* ./
git add .
git commit -m "r7"

git config user.name "red"
git config user.email "red@mail.com"

git switch br1

cp -f ./commits/commit8/* ./
git add .
git commit -m "r8"

cp -f ./commits/commit9/* ./
git add .
git commit -m "r9"

git config user.name "blue"
git config user.email "blue@mail.com"

git switch br3

cp -f ./commits/commit10/* ./
git add .
git commit -m "r10"

git switch br2

cp -f ./commits/commit11/* ./
git add .
git commit -m "r11"

cp -f ./commits/commit12/* ./
git add .
git commit -m "r12"

git switch br3

git merge --no-commit br2 || true
cp -f ./commits/commit13/* ./
git add .
git commit -m "r13"

git config user.name "red"
git config user.email "red@mail.com"

git switch br1

git merge --no-commit br3 || true
cp -f ./commits/commit14/* ./
git add .
git commit -m "r14"