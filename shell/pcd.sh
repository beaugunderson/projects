function pcd() {
  DIRECTORY=`projects get --porcelain $1 directory`

  cd $DIRECTORY
}
